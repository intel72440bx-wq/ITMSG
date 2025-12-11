package com.itmsg.domain.auth.service;

import com.itmsg.domain.auth.dto.LoginRequest;
import com.itmsg.domain.auth.dto.LoginResponse;
import com.itmsg.domain.auth.dto.RefreshTokenResponse;
import com.itmsg.domain.auth.dto.ForgotPasswordRequest;
import com.itmsg.domain.auth.dto.ResetPasswordRequest;
import com.itmsg.domain.user.dto.UserCreateRequest;
import com.itmsg.domain.user.dto.UserResponse;
import com.itmsg.domain.user.entity.User;
import com.itmsg.domain.user.repository.UserRepository;
import com.itmsg.domain.company.entity.Company;
import com.itmsg.domain.company.entity.Department;
import com.itmsg.domain.company.repository.CompanyRepository;
import com.itmsg.domain.company.repository.DepartmentRepository;
import com.itmsg.domain.role.entity.Role;
import com.itmsg.domain.role.repository.RoleRepository;
import com.itmsg.global.exception.BusinessException;
import com.itmsg.global.exception.ErrorCode;
import com.itmsg.global.security.CustomUserDetails;
import com.itmsg.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 인증 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 로그인
     */
    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getEmail());

        try {
            // 1. 사용자 조회 및 기본 검증
            User user = userRepository.findByEmailWithRoles(request.getEmail())
                    .orElseThrow(() -> {
                        log.warn("사용자를 찾을 수 없음: {}", request.getEmail());
                        return new BusinessException(ErrorCode.USER_NOT_FOUND);
                    });

            log.info("사용자 조회 성공: {}, 활성={}, 승인={}, 잠금={}",
                    user.getEmail(), user.getIsActive(), user.getIsApproved(), user.getIsLocked());

            // 2. 계정 상태 상세 체크
            if (!user.getIsActive()) {
                log.warn("비활성화된 계정: {}", user.getEmail());
                throw new BusinessException(ErrorCode.USER_NOT_ACTIVE);
            }
            if (!user.getIsApproved()) {
                log.warn("승인되지 않은 계정: {}", user.getEmail());
                throw new BusinessException(ErrorCode.USER_NOT_APPROVED);
            }
            if (user.getIsLocked()) {
                log.warn("잠긴 계정: {}", user.getEmail());
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }

            // 3. 비밀번호 검증
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("비밀번호 불일치: {}", user.getEmail());

                // 로그인 실패 카운트 증가
                user.loginFailed();
                userRepository.save(user);

                throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
            }

            // 4. 권한 정보 구성
            Collection<GrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> (GrantedAuthority) () -> role.getName())
                    .collect(Collectors.toList());

            log.info("사용자 권한 정보 구성됨: {}", authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList()));

            // 5. 인증 객체 생성
            CustomUserDetails userDetails = new CustomUserDetails(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, authorities);

            // 6. 로그인 성공 처리
            user.loginSuccess();
            userRepository.save(user);
            log.info("로그인 성공 처리 완료: {}", user.getEmail());

            // 7. 토큰 생성
            String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), authorities);
            String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            log.info("토큰 생성 완료: {} (access token length: {})",
                    user.getEmail(), accessToken.length());

            return LoginResponse.of(
                    accessToken,
                    refreshToken,
                    jwtTokenProvider.getAccessTokenValidity(),
                    UserResponse.from(user)
            );

        } catch (BusinessException e) {
            log.error("비즈니스 예외 발생: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("로그인 처리 중 예외 발생: {}", request.getEmail(), e);

            // 로그인 실패 카운트 증가 (BusinessException이 아닌 경우)
            try {
                userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                    user.loginFailed();
                    userRepository.save(user);
                });
            } catch (Exception saveException) {
                log.error("로그인 실패 카운트 증가 중 오류: {}", saveException.getMessage());
            }

            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    /**
     * 회원가입
     */
    @Transactional
    public UserResponse register(UserCreateRequest request) {
        log.info("회원가입 시작: email={}, name={}", request.getEmail(), request.getName());

        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("이미 존재하는 이메일: {}", request.getEmail());
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        // Company 조회 (companyId가 없으면 첫 번째 회사 사용)
        Company company;
        if (request.getCompanyId() != null) {
            log.info("특정 회사 선택: companyId={}", request.getCompanyId());
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> {
                        log.error("존재하지 않는 회사: {}", request.getCompanyId());
                        return new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
                    });
        } else {
            log.info("기본 회사 사용할 예정");
            company = companyRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> {
                        log.error("등록된 회사가 없음");
                        return new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
                    });
            log.info("기본 회사 선택: companyId={}, companyName={}", company.getId(), company.getName());
        }

        // Department 조회 (선택사항)
        Department department = null;
        if (request.getDepartmentId() != null) {
            log.info("부서 선택: departmentId={}", request.getDepartmentId());
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> {
                        log.error("존재하지 않는 부서: {}", request.getDepartmentId());
                        return new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND);
                    });
        }

        // 기본 역할(ROLE_USER) 조회
        log.info("기본 역할 조회 시작: ROLE_USER");
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> {
                    log.error("ROLE_USER 역할이 존재하지 않음");
                    return new BusinessException(ErrorCode.ROLE_NOT_FOUND);
                });
        log.info("기본 역할 조회 성공: roleId={}", userRole.getId());

        // 사용자 생성 (회원가입 시 자동 승인)
        log.info("사용자 생성 시작");
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .company(company)
                .department(department)
                .employeeNumber(request.getEmployeeNumber())
                .position(request.getPosition())
                .isActive(true)
                .isApproved(true)  // 회원가입 시 자동 승인
                .isLocked(false)
                .build();

        // 기본 역할 할당
        log.info("기본 역할 할당: {}", userRole.getName());
        user.assignRole(userRole);

        log.info("사용자 저장 시도");
        User savedUser = userRepository.save(user);
        log.info("신규 사용자 등록 성공: email={}, userId={}", savedUser.getEmail(), savedUser.getId());

        return UserResponse.from(savedUser);
    }

    /**
     * 토큰 갱신
     */
    @Transactional
    public RefreshTokenResponse refreshToken(String refreshToken) {
        try {
            // 리프레시 토큰 검증
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                throw new BusinessException(ErrorCode.INVALID_TOKEN);
            }

            // 리프레시 토큰에서 이메일 추출
            String email = jwtTokenProvider.getEmailFromToken(refreshToken);

            // 사용자 조회
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            // 계정 상태 체크
            if (!user.getIsActive()) {
                throw new BusinessException(ErrorCode.USER_NOT_ACTIVE);
            }
            if (!user.getIsApproved()) {
                throw new BusinessException(ErrorCode.USER_NOT_APPROVED);
            }
            if (user.getIsLocked()) {
                throw new BusinessException(ErrorCode.USER_LOCKED);
            }

            // 새로운 토큰 생성
            Collection<GrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> (GrantedAuthority) () -> role.getName())
                    .collect(Collectors.toList());

            String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(), authorities);
            String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

            log.info("토큰 갱신 성공: {}", user.getEmail());

            return RefreshTokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        } catch (Exception e) {
            log.error("토큰 갱신 실패", e);
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }
    }

    /**
     * 비밀번호 찾기 (임시 비밀번호 발급)
     * 실제 운영 환경에서는 이메일로 임시 비밀번호를 전송해야 합니다.
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 임시 비밀번호 생성 (8자리 랜덤)
        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        
        // 비밀번호 변경 및 초기 비밀번호 변경 필수 설정
        user.changePassword(passwordEncoder.encode(tempPassword));
        user.requirePasswordChange();
        userRepository.save(user);

        log.info("임시 비밀번호 발급: {}", user.getEmail());

        // TODO: 실제 운영 환경에서는 이메일로 임시 비밀번호 전송
        // emailService.sendTempPassword(user.getEmail(), tempPassword);

        // 개발 환경에서는 임시 비밀번호 반환 (운영 환경에서는 제거 필요)
        return tempPassword;
    }

    /**
     * 비밀번호 재설정 (토큰 기반)
     * 향후 이메일 인증 토큰 기반으로 개선 가능
     */
    @Transactional
    public void resetPasswordWithToken(ResetPasswordRequest request) {
        // TODO: 토큰 검증 로직 추가
        // 현재는 간단한 구현으로 이메일 기반 처리
        
        log.info("비밀번호 재설정 완료");
    }
}
