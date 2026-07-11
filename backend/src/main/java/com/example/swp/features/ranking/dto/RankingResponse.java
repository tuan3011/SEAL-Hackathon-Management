package com.example.swp.features.ranking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class RankingResponse {
    private int rank;
    private Long teamId;
    private String teamName;
    private double totalScore;
    // You can add more details here, like a breakdown of scores per criterion
}


