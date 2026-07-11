package com.example.swp.features.criterion.dto.request;

import lombok.Data;

@Data
public class CreateCriterionRequest {
    private String name;
    private String description;
    private int maxScore;
    private int weight;
    private Long hackathonEventId; // Can be null to create a default criterion
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getMaxScore() { return maxScore; }
    public Long getHackathonEventId() { return hackathonEventId; }
    public int getWeight() { return weight; }
}
