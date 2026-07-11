package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DisqualifyTeamRequest {
    @NotBlank(message = "Disqualification reason must not be blank")
    private String reason;
}
