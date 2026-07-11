package com.example.swp.features.track;

import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackMentorResponse;
import com.example.swp.features.track.dto.response.TrackResponse;

import java.util.List;

public interface TrackService {
    TrackResponse createTrack(CreateTrackRequest request);
    List<TrackResponse> getTracksByHackathonEvent(Long hackathonEventId);

    // Track-Mentor assignment (Phase 1 – conflict-of-interest enforcement)
    TrackMentorResponse assignMentor(Long trackId, Long mentorUserId);
    void removeMentor(Long trackId, Long mentorUserId);
    List<TrackMentorResponse> getMentorsByTrack(Long trackId);
    void deleteTrack(Long id);
    TrackResponse updateTrack(Long id, com.example.swp.features.track.dto.request.CreateTrackRequest request);
}
