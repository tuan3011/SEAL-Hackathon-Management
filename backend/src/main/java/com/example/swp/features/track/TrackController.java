package com.example.swp.features.track;

import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackMentorResponse;
import com.example.swp.features.track.dto.response.TrackResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracks")
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    // ── Existing endpoints – UNCHANGED ────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<TrackResponse>> createTrack(@Valid @RequestBody CreateTrackRequest request) {
        TrackResponse response = trackService.createTrack(request);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Track created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/hackathon/{hackathonEventId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<TrackResponse>>> getTracksByHackathonEvent(@PathVariable Long hackathonEventId) {
        List<TrackResponse> responses = trackService.getTracksByHackathonEvent(hackathonEventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    // ── Track-Mentor assignment endpoints (Phase 1) ───────────────────────────

    @PostMapping("/{trackId}/mentors/{mentorUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<TrackMentorResponse>> assignMentor(
            @PathVariable Long trackId,
            @PathVariable Long mentorUserId) {
        TrackMentorResponse response = trackService.assignMentor(trackId, mentorUserId);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Mentor assigned successfully."), HttpStatus.CREATED);
    }

    @DeleteMapping("/{trackId}/mentors/{mentorUserId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> removeMentor(
            @PathVariable Long trackId,
            @PathVariable Long mentorUserId) {
        trackService.removeMentor(trackId, mentorUserId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Mentor removed successfully."));
    }

    @GetMapping("/{trackId}/mentors")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<TrackMentorResponse>>> getMentorsByTrack(@PathVariable Long trackId) {
        List<TrackMentorResponse> responses = trackService.getMentorsByTrack(trackId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> deleteTrack(@PathVariable Long id) {
        trackService.deleteTrack(id);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Track deleted successfully."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<TrackResponse>> updateTrack(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.example.swp.features.track.dto.request.CreateTrackRequest request) {
        TrackResponse response = trackService.updateTrack(id, request);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(response, "Track updated successfully."));
    }
}