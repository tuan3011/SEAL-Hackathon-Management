package com.example.swp.features.submission.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateSubmissionRequest {
    @NotNull(message = "Team ID cannot be null")
    private Long teamId;

    @NotNull(message = "Round ID cannot be null")
    private Long roundId;

    @Pattern(regexp = "^(https?://)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$", message = "Invalid repository URL format")
    private String repositoryUrl;

    @Pattern(regexp = "^(https?://)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$", message = "Invalid demo URL format")
    private String demoUrl;

    private String reportUrl;

    public Long getTeamId() { return teamId; }
    public Long getRoundId() { return roundId; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public String getDemoUrl() { return demoUrl; }
    public String getReportUrl() { return reportUrl; }
}
