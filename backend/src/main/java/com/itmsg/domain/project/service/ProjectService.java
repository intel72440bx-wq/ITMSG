package com.itmsg.domain.project.service;

import com.itmsg.domain.company.entity.Company;
import com.itmsg.domain.company.repository.CompanyRepository;

import com.itmsg.domain.partner.service.PartnerService;
import com.itmsg.domain.project.dto.ProjectRequest;
import com.itmsg.domain.project.dto.ProjectResponse;
import com.itmsg.domain.project.entity.Project;
import com.itmsg.domain.project.entity.ProjectStatus;
import com.itmsg.domain.project.entity.ProjectType;
import com.itmsg.domain.project.repository.ProjectRepository;
import com.itmsg.domain.user.entity.User;
import com.itmsg.domain.user.repository.UserRepository;
import com.itmsg.global.exception.BusinessException;
import com.itmsg.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 프로젝트 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final PartnerService partnerService;
    private final UserRepository userRepository;
    
    /**
     * 프로젝트 등록
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        // 프로젝트 코드 중복 확인
        if (projectRepository.existsByCode(request.getCode())) {
            throw new BusinessException(ErrorCode.DUPLICATE_PROJECT_CODE);
        }
        
        // 회사 조회: companyId가 없으면 현재 로그인한 사용자의 회사 사용
        Company company;
        if (request.getCompanyId() != null) {
            // 먼저 Company에서 조회
            Optional<Company> companyOpt = companyRepository.findById(request.getCompanyId());
            if (companyOpt.isPresent()) {
                company = companyOpt.get();
            } else {
                // Company에 없으면 Partner로 간주하고 Partner 정보를 조회
                try {
                    var partnerResponse = partnerService.getPartner(request.getCompanyId());
                    // 파트너의 businessNumber로 동일한 회사가 있는지 확인
                    Optional<Company> existingCompany = companyRepository.findByBusinessNumber(partnerResponse.businessNumber());
                    if (existingCompany.isPresent()) {
                        company = existingCompany.get();
                    } else {
                        // 없으면 파트너 정보를 기반으로 새 회사 생성
                        Company newCompany = Company.builder()
                                .code(partnerResponse.code())
                                .name(partnerResponse.name())
                                .businessNumber(partnerResponse.businessNumber())
                                .ceoName(partnerResponse.ceoName())
                                .build();
                        company = companyRepository.save(newCompany);
                    }
                } catch (Exception e) {
                    throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND, "선택한 회사를 찾을 수 없습니다.");
                }
            }
        } else {
            // 현재 로그인한 사용자의 회사 조회
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            if (currentUser.getCompany() == null) {
                throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
            }
            company = currentUser.getCompany();
        }
        
        // PM 조회 (선택사항)
        User pm = null;
        if (request.getPmId() != null) {
            pm = userRepository.findById(request.getPmId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }
        
        // 프로젝트 생성 (초기 상태는 PREPARING)
        Project project = Project.builder()
                .code(request.getCode())
                .name(request.getName())
                .projectType(request.getProjectType())
                .status(ProjectStatus.PREPARING)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .company(company)
                .description(request.getDescription())
                .budget(request.getBudget())
                .pm(pm)
                .build();
        
        Project savedProject = projectRepository.save(project);
        return ProjectResponse.from(savedProject);
    }
    
    /**
     * 프로젝트 조회
     */
    public ProjectResponse getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 목록 조회 (검색 및 필터링)
     */
    public Page<ProjectResponse> searchProjects(String name, ProjectType projectType,
                                                 ProjectStatus status, Long companyId,
                                                 LocalDate startDate, LocalDate endDate,
                                                 Pageable pageable) {
        Page<Project> projects = projectRepository.search(
                name, projectType, status, companyId, startDate, endDate, pageable);
        return projects.map(ProjectResponse::from);
    }
    
    /**
     * 프로젝트 수정
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        project.updateInfo(request.getName(), request.getDescription(),
                request.getEndDate(), request.getBudget());
        
        // PM 변경
        if (request.getPmId() != null) {
            User pm = userRepository.findById(request.getPmId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            project.assignPm(pm);
        }
        
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 상태 변경
     */
    @Transactional
    public ProjectResponse changeStatus(Long id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        
        project.changeStatus(status);
        return ProjectResponse.from(project);
    }
    
    /**
     * 프로젝트 삭제 (Soft Delete)
     */
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        project.delete();
    }

    /**
     * 파트너별 담당자 PM 프로젝트 조회
     * 특정 파트너의 담당자가 PM으로 있는 프로젝트들을 조회
     */
    public Page<ProjectResponse> getProjectsByPartnerManager(Long partnerId, Pageable pageable) {
        // 파트너의 담당자 조회
        var partnerResponse = partnerService.getPartner(partnerId);
        if (partnerResponse.managerId() == null) {
            // 담당자가 없는 경우 빈 결과 반환
            return Page.empty(pageable);
        }

        // 담당자가 PM인 프로젝트들 조회
        return projectRepository.findByPmId(partnerResponse.managerId(), pageable)
                .map(ProjectResponse::from);
    }
}
