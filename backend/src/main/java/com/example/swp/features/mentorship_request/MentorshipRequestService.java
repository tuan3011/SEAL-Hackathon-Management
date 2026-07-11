package com.example.swp.features.mentorship_request;

import com.example.swp.features.mentorship_request.dto.request.CreateMentorshipRequest;
import com.example.swp.features.mentorship_request.dto.response.MentorshipRequestResponse;
import com.example.swp.features.mentorship_request.dto.request.RejectMentorshipRequest;
import com.example.swp.features.mentorship_request.dto.request.ResolveMentorshipRequest;

import java.util.List;

public interface MentorshipRequestService {
    MentorshipRequestResponse createRequest(CreateMentorshipRequest request);
    MentorshipRequestResponse acceptRequest(Long requestId);
    MentorshipRequestResponse resolveRequest(Long requestId, ResolveMentorshipRequest payload);
    MentorshipRequestResponse rejectRequest(Long requestId, RejectMentorshipRequest payload);
    void cancelRequest(Long requestId);
    MentorshipRequestResponse releaseRequest(Long requestId);
    List<MentorshipRequestResponse> getOpenRequests();
    MentorshipRequestResponse getRequestById(Long id);
    List<MentorshipRequestResponse> getMyMentorshipRequests();
}
