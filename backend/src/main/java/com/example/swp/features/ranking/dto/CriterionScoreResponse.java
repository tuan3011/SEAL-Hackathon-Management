package com.example.swp.features.ranking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class CriterionScoreResponse {
    private Long criterionId;
    private String criterionName;
    private double averageScore;
}

