package com.example.swp.features.mentorship_request.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMentorshipRequest {
    @NotNull
    private Long teamId;

    @NotBlank
    private String title;

    private String description;

    public Long getTeamId() { return teamId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
}
