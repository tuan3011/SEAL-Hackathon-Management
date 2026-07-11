package com.example.swp.features.score.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class ScoreResponse {
    private Long id;
    private Long judgeId;
    private Long submissionId;
    private Long criterionId;
    private int scoreValue;
    private String comment;
    private boolean isFinalized;
    private LocalDateTime scoredAt;

    public static ScoreResponseBuilder builder() { return new ScoreResponseBuilder(); }
    public static class ScoreResponseBuilder {
        private Long id;
        private Long judgeId;
        private Long submissionId;
        private Long criterionId;
        private int scoreValue;
        private String comment;
        private boolean isFinalized;
        private LocalDateTime scoredAt;

        public ScoreResponseBuilder id(Long id) { this.id = id; return this; }
        public ScoreResponseBuilder judgeId(Long judgeId) { this.judgeId = judgeId; return this; }
        public ScoreResponseBuilder submissionId(Long submissionId) { this.submissionId = submissionId; return this; }
        public ScoreResponseBuilder criterionId(Long criterionId) { this.criterionId = criterionId; return this; }
        public ScoreResponseBuilder scoreValue(int scoreValue) { this.scoreValue = scoreValue; return this; }
        public ScoreResponseBuilder comment(String comment) { this.comment = comment; return this; }
        public ScoreResponseBuilder isFinalized(boolean isFinalized) { this.isFinalized = isFinalized; return this; }
        public ScoreResponseBuilder scoredAt(LocalDateTime scoredAt) { this.scoredAt = scoredAt; return this; }

        public ScoreResponse build() {
            ScoreResponse r = new ScoreResponse();
            r.id = this.id; r.judgeId = this.judgeId; r.submissionId = this.submissionId;
            r.criterionId = this.criterionId; r.scoreValue = this.scoreValue;
            r.comment = this.comment; r.isFinalized = this.isFinalized;
            r.scoredAt = this.scoredAt;
            return r;
        }
    }
}


