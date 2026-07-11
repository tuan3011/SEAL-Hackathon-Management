package com.example.swp.features.score;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.score.dto.request.CreateScoreRequest;
import com.example.swp.features.score.dto.response.ScoreResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE')")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> saveScores(@Valid @RequestBody CreateScoreRequest request) {
        List<ScoreResponse> responses = scoreService.saveScores(request);
        return new ResponseEntity<>(ApiResponse.success(responses, "Scores saved successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'JUDGE', 'GUEST_JUDGE', 'MENTOR')")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getScoresForSubmission(@PathVariable Long submissionId) {
        List<ScoreResponse> responses = scoreService.getScoresForSubmission(submissionId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/submission/{submissionId}/judge/{judgeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'JUDGE', 'GUEST_JUDGE', 'MENTOR')")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getScoresForSubmissionByJudge(@PathVariable Long submissionId, @PathVariable Long judgeId) {
        List<ScoreResponse> responses = scoreService.getScoresForSubmissionByJudge(submissionId, judgeId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/my-scores/round/{roundId}")
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE')")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getMyScoresForRound(@PathVariable Long roundId) {
        List<ScoreResponse> responses = scoreService.getMyScoresForRound(roundId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/my-scores/submission/{submissionId}")
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE')")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> getMyScoresForSubmission(@PathVariable("submissionId") Long submissionId) {
        List<ScoreResponse> responses = scoreService.getMyScoresForSubmission(submissionId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping(value = "/my-scores/export")
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE')")
    public ResponseEntity<byte[]> exportMyScores() {
        byte[] csvData = scoreService.exportMyScoresCsv();
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "my_scores.csv");
        
        return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
    }
    
    @PostMapping("/finalize/round/{roundId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> finalizeScores(@PathVariable Long roundId) {
        scoreService.finalizeScores(roundId);
        return ResponseEntity.ok(ApiResponse.success(null, "Scores for the round have been finalized."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE', 'ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<ScoreResponse>> updateScore(@PathVariable Long id, @Valid @RequestBody com.example.swp.features.score.dto.request.UpdateScoreRequest request) {
        ScoreResponse response = scoreService.updateScore(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Score updated successfully."));
    }
}
