package com.itmsg.domain.dashboard.controller;

import com.itmsg.domain.dashboard.dto.DashboardStatsResponse;
import com.itmsg.domain.dashboard.dto.RecentActivityResponse;
import com.itmsg.domain.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "대시보드 API")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "대시보드 통계 조회", description = "대시보드에 표시할 주요 통계 데이터를 조회합니다.")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/activities")
    @Operation(summary = "최근 활동 조회", description = "대시보드에 표시할 최근 활동 목록을 조회합니다.")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivities(
            @Parameter(description = "조회할 활동 개수 (기본값: 10)") @RequestParam(defaultValue = "10") int limit) {
        List<RecentActivityResponse> activities = dashboardService.getRecentActivities(limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/activities/all")
    @Operation(summary = "전체 최근 활동 조회", description = "페이징 처리된 전체 최근 활동 목록을 조회합니다.")
    public ResponseEntity<Page<RecentActivityResponse>> getAllRecentActivities(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "활동 타입 필터 (sr, project, approval)") @RequestParam(required = false) String type) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RecentActivityResponse> activities = dashboardService.getAllRecentActivities(pageable, type);
        return ResponseEntity.ok(activities);
    }
}
