package com.example.swp.features.team.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTeamRequest {
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String projectName;

    private String projectDescription;
    
    private Long trackId;
    
    public String getName() { return name; }
    public String getProjectName() { return projectName; }
    public String getProjectDescription() { return projectDescription; }
    public Long getTrackId() { return trackId; }
}
