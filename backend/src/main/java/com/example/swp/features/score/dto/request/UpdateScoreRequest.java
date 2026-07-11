package com.example.swp.features.score.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateScoreRequest {
    @NotNull(message = "Score value cannot be null")
    @Min(value = 0, message = "Score must be at least 0")
    @Max(value = 100, message = "Score must not exceed 100")
    private Integer scoreValue;

    private String comment;
    
    public Integer getScoreValue() { return scoreValue; }
    public String getComment() { return comment; }
}
