package com.example.swp.features.submission;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.submission.dto.request.CreateSubmissionRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> createOrUpdateSubmission(@Valid @RequestBody CreateSubmissionRequest request) {
        SubmissionResponse response = submissionService.createSubmission(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Submission saved successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionById(@PathVariable Long id) {
        SubmissionResponse response = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/team/{teamId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByTeam(@PathVariable Long teamId) {
        List<SubmissionResponse> responses = submissionService.getSubmissionsByTeam(teamId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/round/{roundId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByRound(@PathVariable Long roundId) {
        List<SubmissionResponse> responses = submissionService.getSubmissionsByRound(roundId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByEvent(@PathVariable Long eventId) {
        List<SubmissionResponse> responses = submissionService.getSubmissionsByEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
