package com.example.swp.features.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long activeTeams;
    private long submissionsReceived;
    private long pendingReviews;
    private long daysRemaining;
    private List<CriterionVarianceDto> criterionVariances;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriterionVarianceDto {
        private Long criterionId;
        private String criterionName;
        private double variance;
    }
}
