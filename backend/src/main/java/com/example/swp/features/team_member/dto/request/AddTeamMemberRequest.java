package com.example.swp.features.team_member.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddTeamMemberRequest {
    @NotNull(message = "Team ID cannot be null")
    private Long teamId;
    
    @NotNull(message = "User ID cannot be null")
    private Long userId;
    private boolean isLeader;

    public Long getTeamId() { return teamId; }
    public Long getUserId() { return userId; }
    public boolean isLeader() { return isLeader; }
}
