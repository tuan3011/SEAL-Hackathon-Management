package com.example.swp.features.team_invitation.dto.request;

import com.example.swp.features.team_invitation.InvitationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RespondToInvitationRequest {
    @NotNull
    private InvitationStatus response; // ACCEPTED or DECLINED
    public InvitationStatus getResponse() { return response; }
}
