package com.example.swp.features.team_member.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransferLeadershipRequest {
    @NotNull(message = "New leader user ID cannot be null")
    private Long newLeaderUserId;

    @NotNull(message = "Team ID cannot be null")
    private Long teamId;
    
    public Long getNewLeaderUserId() { return newLeaderUserId; }
    public Long getTeamId() { return teamId; }
}
