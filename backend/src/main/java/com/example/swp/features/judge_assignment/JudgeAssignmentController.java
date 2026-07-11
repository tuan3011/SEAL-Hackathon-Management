package com.example.swp.features.judge_assignment;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.judge_assignment.dto.request.AssignJudgeRequest;
import com.example.swp.features.judge_assignment.dto.response.JudgeAssignmentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/judge-assignments")
@RequiredArgsConstructor
public class JudgeAssignmentController {

    private final JudgeAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<JudgeAssignmentResponse>> assignJudge(@Valid @RequestBody AssignJudgeRequest request) {
        JudgeAssignmentResponse response = assignmentService.assignJudge(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Judge assigned successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasAnyRole('JUDGE', 'GUEST_JUDGE')")
    public ResponseEntity<ApiResponse<List<JudgeAssignmentResponse>>> getMyAssignments() {
        List<JudgeAssignmentResponse> responses = assignmentService.getMyAssignments();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @GetMapping("/judge/{judgeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<JudgeAssignmentResponse>>> getAssignmentsForJudge(@PathVariable("judgeId") Long judgeId) {
        List<JudgeAssignmentResponse> responses = assignmentService.getAssignmentsForJudge(judgeId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/round/{roundId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<JudgeAssignmentResponse>>> getAssignmentsForRound(@PathVariable("roundId") Long roundId) {
        List<JudgeAssignmentResponse> responses = assignmentService.getAssignmentsForRound(roundId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<JudgeAssignmentResponse>>> getAssignmentsForEvent(@PathVariable("eventId") Long eventId) {
        List<JudgeAssignmentResponse> responses = assignmentService.getAssignmentsForEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> unassignJudge(@PathVariable("assignmentId") Long assignmentId) {
        assignmentService.unassignJudge(assignmentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Judge unassigned successfully."));
    }
}
