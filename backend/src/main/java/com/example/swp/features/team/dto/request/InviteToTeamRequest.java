package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteToTeamRequest {
    @NotBlank
    @Email
    private String inviteeEmail;
}