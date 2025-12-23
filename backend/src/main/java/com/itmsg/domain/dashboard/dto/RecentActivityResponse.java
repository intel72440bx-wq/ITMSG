package com.itmsg.domain.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RecentActivityResponse {
    private String id;
    private String type; // 'sr', 'project', 'approval', 'issue', 'incident'
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private String status;
    private String userName; // 활동을 수행한 사용자
}
