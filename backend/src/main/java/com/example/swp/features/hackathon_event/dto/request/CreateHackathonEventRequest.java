package com.example.swp.features.hackathon_event.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateHackathonEventRequest {

    @NotBlank(message = "Hackathon event name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Start time cannot be null")
    private LocalDateTime startTime;

    @NotNull(message = "End time cannot be null")
    private LocalDateTime endTime;

    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;

    @Min(value = 1, message = "Minimum team size must be at least 1")
    private Integer minTeamSize;

    @Min(value = 1, message = "Maximum team size must be at least 1")
    private Integer maxTeamSize;

    private String rules;
    private String imageUrl;
    private Long organizerId;
}
