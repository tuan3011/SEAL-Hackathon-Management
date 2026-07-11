package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RespondToInvitationRequest {
    @NotBlank
    @Pattern(regexp = "ACCEPTED|DECLINED", message = "Status must be either ACCEPTED or DECLINED")
    private String status;
}