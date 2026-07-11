package com.example.swp.features.submission;

import com.example.swp.features.submission.dto.request.CreateSubmissionRequest;
import com.example.swp.features.submission.dto.response.SubmissionResponse;

import java.util.List;

public interface SubmissionService {
    SubmissionResponse createSubmission(CreateSubmissionRequest request);
    List<SubmissionResponse> getSubmissionsByTeam(Long teamId);
    List<SubmissionResponse> getSubmissionsByRound(Long roundId);
    List<SubmissionResponse> getSubmissionsByEvent(Long eventId);
    SubmissionResponse getSubmissionById(Long id);
}
