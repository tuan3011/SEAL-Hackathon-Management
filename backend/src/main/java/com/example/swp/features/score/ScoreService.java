package com.example.swp.features.score;

import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;

import java.util.List;

public interface ScoreService {
    List<ScoreResponse> saveScores(CreateScoreRequest request);
    List<ScoreResponse> getScoresForSubmission(Long submissionId);
    List<ScoreResponse> getScoresForSubmissionByJudge(Long submissionId, Long judgeId);
    List<ScoreResponse> getMyScoresForRound(Long roundId);
    List<ScoreResponse> getMyScoresForSubmission(Long submissionId);
    void finalizeScores(Long roundId);
    ScoreResponse updateScore(Long scoreId, com.example.swp.features.score.dto.request.UpdateScoreRequest request);
    byte[] exportMyScoresCsv();
}
