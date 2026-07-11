package com.example.swp.features.judge_assignment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignJudgeRequest {
    @NotNull
    private Long judgeId;
    @NotNull
    private Long roundId;
    
    private Long trackId;

    public Long getJudgeId() { return judgeId; }
    public Long getRoundId() { return roundId; }
    public Long getTrackId() { return trackId; }
}
