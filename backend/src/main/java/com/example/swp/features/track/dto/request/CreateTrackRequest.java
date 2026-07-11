package com.example.swp.features.track.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTrackRequest {
    @NotBlank(message = "Track name cannot be empty")
    private String name;

    private String description;

    @NotNull(message = "Hackathon Event ID cannot be null")
    private Long hackathonEventId;

    public String getName() { return name; }
    public String getDescription() { return description; }
    public Long getHackathonEventId() { return hackathonEventId; }
}
