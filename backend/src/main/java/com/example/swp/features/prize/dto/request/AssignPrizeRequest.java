package com.example.swp.features.prize.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignPrizeRequest {
    @NotNull(message = "Team ID cannot be null")
    private Long teamId;
    public Long getTeamId() { return teamId; }
}
