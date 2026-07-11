package com.example.swp.features.criterion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCriterionRequest {
    @NotBlank(message = "Criterion name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Weight cannot be null")
    private Integer weight;
    
    private Integer maxScore;
    
    private Long hackathonEventId;
    
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Integer getWeight() { return weight; }
    public Integer getMaxScore() { return maxScore; }
    public Long getHackathonEventId() { return hackathonEventId; }
}
