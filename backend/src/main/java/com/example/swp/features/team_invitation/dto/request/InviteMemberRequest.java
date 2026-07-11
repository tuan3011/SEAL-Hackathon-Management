package com.example.swp.features.team_invitation.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InviteMemberRequest {
    @NotNull
    private Long teamId;

    @NotNull
    @Email
    private String inviteeEmail;

    public Long getTeamId() { return teamId; }
    public String getInviteeEmail() { return inviteeEmail; }
}
