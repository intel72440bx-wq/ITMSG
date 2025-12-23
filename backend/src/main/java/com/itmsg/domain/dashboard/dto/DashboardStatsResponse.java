package com.itmsg.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private int activeProjects;
    private int srRequestsThisMonth;
    private int pendingApprovals;
    private double completionRate;
    private int totalUsers;
    private int totalIssues;
    private int totalIncidents;
    private int totalAssets;

    // 트렌드 데이터 (전월 대비 증감률)
    private double activeProjectsTrend;
    private double srRequestsTrend;
    private double pendingApprovalsTrend;
    private double completionRateTrend;
}
