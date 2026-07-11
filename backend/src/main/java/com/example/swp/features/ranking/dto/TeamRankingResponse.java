package com.example.swp.features.ranking.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamRankingResponse {
    private int rank;
    private Long teamId;
    private String teamName;
    private String projectName;
    private BigDecimal finalScore;
    private Long trackId;
    private String trackName;
    private List<CriterionScoreDto> criterionBreakdown;
    private java.time.LocalDateTime submittedAt;

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
    public BigDecimal getFinalScore() { return finalScore; }
    public java.time.LocalDateTime getSubmittedAt() { return submittedAt; }

    @Data
    @Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CriterionScoreDto {
        private Long criterionId;
        private String criterionName;
        private double averageScore;
        private int weight;
    }

    public static TeamRankingResponseBuilder builder() { return new TeamRankingResponseBuilder(); }
    public static class TeamRankingResponseBuilder {
        private int rank;
        private Long teamId;
        private String teamName;
        private String projectName;
        private BigDecimal finalScore;
        private Long trackId;
        private String trackName;
        private List<CriterionScoreDto> criterionBreakdown;
        private java.time.LocalDateTime submittedAt;

        public TeamRankingResponseBuilder rank(int rank) { this.rank = rank; return this; }
        public TeamRankingResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TeamRankingResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public TeamRankingResponseBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public TeamRankingResponseBuilder finalScore(BigDecimal finalScore) { this.finalScore = finalScore; return this; }
        public TeamRankingResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public TeamRankingResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public TeamRankingResponseBuilder criterionBreakdown(List<CriterionScoreDto> criterionBreakdown) { this.criterionBreakdown = criterionBreakdown; return this; }
        public TeamRankingResponseBuilder submittedAt(java.time.LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public TeamRankingResponse build() {
            TeamRankingResponse r = new TeamRankingResponse();
            r.rank = this.rank; r.teamId = this.teamId; r.teamName = this.teamName;
            r.projectName = this.projectName; r.finalScore = this.finalScore;
            r.trackId = this.trackId; r.trackName = this.trackName;
            r.criterionBreakdown = this.criterionBreakdown;
            r.submittedAt = this.submittedAt;
            return r;
        }
    }
}
