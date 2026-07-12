package com.example.swp.features.mentorship_request.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMentorshipRequest {
    @NotNull
    private Long teamId;

    @NotBlank(message = "Title cannot be empty")
    @jakarta.validation.constraints.Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @jakarta.validation.constraints.Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    public Long getTeamId() { return teamId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
}
