package com.itmsg.domain.dashboard.service;

import com.itmsg.domain.approval.entity.Approval;
import com.itmsg.domain.approval.repository.ApprovalRepository;
import com.itmsg.domain.asset.repository.AssetRepository;
import com.itmsg.domain.dashboard.dto.DashboardStatsResponse;
import com.itmsg.domain.dashboard.dto.RecentActivityResponse;
import com.itmsg.domain.incident.repository.IncidentRepository;
import com.itmsg.domain.issue.repository.IssueRepository;
import com.itmsg.domain.project.entity.Project;
import com.itmsg.domain.project.repository.ProjectRepository;
import com.itmsg.domain.sr.entity.ServiceRequest;
import com.itmsg.domain.sr.repository.ServiceRequestRepository;
import com.itmsg.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final ApprovalRepository approvalRepository;
    private final UserRepository userRepository;
    private final IssueRepository issueRepository;
    private final IncidentRepository incidentRepository;
    private final AssetRepository assetRepository;

    public DashboardStatsResponse getDashboardStats() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfLastMonth = now.minusMonths(1).withDayOfMonth(1);
        LocalDate endOfLastMonth = now.withDayOfMonth(1).minusDays(1);

        // 이번 달 SR 요청 수
        int srRequestsThisMonth = getSrRequestsThisMonth();

        // 활성 프로젝트 수 (진행 중인 프로젝트)
        int activeProjects = getActiveProjects();

        // 승인 대기 수
        int pendingApprovals = getPendingApprovals();

        // 완료율 계산 (완료된 SR / 전체 SR * 100)
        double completionRate = calculateCompletionRate();

        // 총 사용자 수
        int totalUsers = (int) userRepository.count();

        // 총 이슈 수
        int totalIssues = (int) issueRepository.count();

        // 총 장애 수
        int totalIncidents = (int) incidentRepository.count();

        // 총 자산 수
        int totalAssets = (int) assetRepository.count();

        // 트렌드 계산 (전월 대비 증감률)
        double activeProjectsTrend = calculateTrend(activeProjects, getActiveProjectsLastMonth());
        double srRequestsTrend = calculateTrend(srRequestsThisMonth, getSrRequestsLastMonth());
        double pendingApprovalsTrend = calculateTrend(pendingApprovals, getPendingApprovalsLastMonth());
        double completionRateTrend = calculateTrend(completionRate, getCompletionRateLastMonth());

        return DashboardStatsResponse.builder()
                .activeProjects(activeProjects)
                .srRequestsThisMonth(srRequestsThisMonth)
                .pendingApprovals(pendingApprovals)
                .completionRate(completionRate)
                .totalUsers(totalUsers)
                .totalIssues(totalIssues)
                .totalIncidents(totalIncidents)
                .totalAssets(totalAssets)
                .activeProjectsTrend(activeProjectsTrend)
                .srRequestsTrend(srRequestsTrend)
                .pendingApprovalsTrend(pendingApprovalsTrend)
                .completionRateTrend(completionRateTrend)
                .build();
    }

    public List<RecentActivityResponse> getRecentActivities(int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();
        Pageable pageable = PageRequest.of(0, limit / 4); // 각 타입별로 균등하게 가져오기 위해 나누기

        // 최근 SR 요청
        List<ServiceRequest> recentSRs = serviceRequestRepository.findAll(pageable).getContent();
        for (ServiceRequest sr : recentSRs) {
            activities.add(RecentActivityResponse.builder()
                    .id("sr-" + sr.getId())
                    .type("sr")
                    .title("SR-" + sr.getSrNumber())
                    .description(sr.getTitle())
                    .createdAt(sr.getCreatedAt())
                    .status("요청됨")
                    .userName(sr.getRequester() != null ? sr.getRequester().getName() : "Unknown")
                    .build());
        }

        // 최근 프로젝트
        List<Project> recentProjects = projectRepository.findAll(pageable).getContent();
        for (Project project : recentProjects) {
            activities.add(RecentActivityResponse.builder()
                    .id("project-" + project.getId())
                    .type("project")
                    .title(project.getName())
                    .description("프로젝트 생성됨")
                    .createdAt(project.getCreatedAt())
                    .status("진행 중")
                    .userName(project.getPm() != null ? project.getPm().getName() : "Unknown")
                    .build());
        }

        // 최근 승인 요청
        List<Approval> recentApprovals = approvalRepository.findAll(pageable).getContent();
        for (Approval approval : recentApprovals) {
            activities.add(RecentActivityResponse.builder()
                    .id("approval-" + approval.getId())
                    .type("approval")
                    .title("승인-" + approval.getApprovalNumber())
                    .description(approval.getTitle())
                    .createdAt(approval.getRequestedAt())
                    .status(approval.getStatus().toString())
                    .userName(approval.getRequester() != null ? approval.getRequester().getName() : "Unknown")
                    .build());
        }

        // 시간순으로 정렬 (최신순)
        activities.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // 제한된 개수만큼 반환
        return activities.stream().limit(limit).toList();
    }

    private int getActiveProjects() {
        // ProjectStatus.ACTIVE 또는 진행 중인 프로젝트 수를 계산
        // 현재는 간단히 모든 프로젝트 수를 반환 (실제로는 상태별로 필터링 필요)
        return (int) projectRepository.count();
    }

    private int getSrRequestsThisMonth() {
        // 이번 달 SR 요청 수
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);

        // ServiceRequestRepository에 이번 달 SR 수를 계산하는 메서드가 없으므로
        // 간단히 전체 카운트로 대체 (실제로는 날짜 필터링 쿼리 필요)
        return (int) serviceRequestRepository.count();
    }

    private int getPendingApprovals() {
        // 승인 대기 중인 항목 수
        return approvalRepository.findPendingApprovalsByApproverId(null).size(); // 모든 승인자 대상
    }

    private double calculateCompletionRate() {
        // 완료율 계산 로직 (실제로는 상태별로 계산 필요)
        long totalSr = serviceRequestRepository.count();
        if (totalSr == 0) return 0.0;

        // 완료된 SR 수 계산 (실제로는 SrStatus.COMPLETED 등으로 필터링 필요)
        // 현재는 임시로 85%로 설정
        return 85.0;
    }

    private int getActiveProjectsLastMonth() {
        // 전월 활성 프로젝트 수 (실제로는 날짜별 계산 필요)
        return getActiveProjects();
    }

    private int getSrRequestsLastMonth() {
        // 전월 SR 요청 수 (실제로는 날짜별 계산 필요)
        return getSrRequestsThisMonth();
    }

    private int getPendingApprovalsLastMonth() {
        // 전월 승인 대기 수 (실제로는 날짜별 계산 필요)
        return getPendingApprovals();
    }

    private double getCompletionRateLastMonth() {
        // 전월 완료율 (실제로는 날짜별 계산 필요)
        return calculateCompletionRate();
    }

    private double calculateTrend(double current, double previous) {
        if (previous == 0) return 0.0;
        return ((current - previous) / previous) * 100.0;
    }
}
