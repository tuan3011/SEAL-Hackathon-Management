package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTeamRequest {
    @NotBlank(message = "Team name cannot be empty")
    private String name;

    private String projectName;
    private String projectDescription;

    @NotNull(message = "Track ID cannot be null")
    private Long trackId;

    @NotNull(message = "Event ID cannot be null")
    private Long eventId;

    public String getName() { return name; }
    public String getProjectName() { return projectName; }
    public String getProjectDescription() { return projectDescription; }
    public Long getTrackId() { return trackId; }
    public Long getEventId() { return eventId; }
}
