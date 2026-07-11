package com.example.swp.features.criterion.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class CriterionResponse {
    private Long id;
    private String name;
    private String description;
    private int maxScore;
    private int weight;
    private Long hackathonEventId;
    private boolean isDefault;

    public static CriterionResponseBuilder builder() { return new CriterionResponseBuilder(); }
    public static class CriterionResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private int maxScore;
        private int weight;
        private Long hackathonEventId;
        private boolean isDefault;

        public CriterionResponseBuilder id(Long id) { this.id = id; return this; }
        public CriterionResponseBuilder name(String name) { this.name = name; return this; }
        public CriterionResponseBuilder description(String description) { this.description = description; return this; }
        public CriterionResponseBuilder maxScore(int maxScore) { this.maxScore = maxScore; return this; }
        public CriterionResponseBuilder weight(int weight) { this.weight = weight; return this; }
        public CriterionResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }
        public CriterionResponseBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }
        
        public CriterionResponse build() {
            CriterionResponse c = new CriterionResponse();
            c.id = this.id; c.name = this.name; c.description = this.description;
            c.maxScore = this.maxScore;
            c.weight = this.weight; c.hackathonEventId = this.hackathonEventId; c.isDefault = this.isDefault;
            return c;
        }
    }
}


