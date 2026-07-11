package com.example.swp.features.track;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackMentorResponse;
import com.example.swp.features.track.dto.response.TrackResponse;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final TrackMentorRepository trackMentorRepository;  // NEW
    private final UserRepository userRepository;                 // NEW
    private final AuditLogService auditLogService;               // NEW

    // ── Existing methods – UNCHANGED ──────────────────────────────────────────

    @Override
    public TrackResponse createTrack(CreateTrackRequest request) {
        HackathonEvent hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with id: " + request.getHackathonEventId()));

        if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT 
                && hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot create track: Configurations can only be added to events in DRAFT or PUBLISHED status.");
        }

        boolean nameExists = trackRepository.findByHackathonEventId(hackathonEvent.getId()).stream()
                .anyMatch(t -> t.getName().equalsIgnoreCase(request.getName().trim()));
        if (nameExists) {
            throw new com.example.swp.exception.BadRequestException("Bảng đấu với tên này đã tồn tại trong cuộc thi.");
        }

        Track newTrack = Track.builder()
                .name(request.getName())
                .description(request.getDescription())
                .hackathonEvent(hackathonEvent)
                .build();

        Track savedTrack = trackRepository.save(newTrack);
        auditLogService.logAction("CREATE_TRACK", "TRACK", savedTrack.getId(), null, "Created track " + savedTrack.getName(), hackathonEvent.getId());
        return mapToResponse(savedTrack);
    }

    @Override
    public List<TrackResponse> getTracksByHackathonEvent(Long hackathonEventId) {
        return trackRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── New methods – Track-Mentor assignment ─────────────────────────────────

    /**
     * Assigns a mentor (MENTOR or JUDGE role) to a track.
     * WHY: Organizer must officially assign mentors to tracks so the system
     * can enforce the conflict-of-interest rule (cannot judge a track you mentor).
     *
     * Validation:
     * - GUEST_JUDGE cannot be assigned as mentor (business rule)
     * - Only MENTOR or JUDGE roles are valid mentor candidates
     * - Duplicate assignment is rejected
     */
    @Override
    @Transactional
    public TrackMentorResponse assignMentor(Long trackId, Long mentorUserId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found: " + trackId));

        User mentor = userRepository.findById(mentorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + mentorUserId));

        // Security: Guest Judge cannot be a mentor
        if (mentor.getRole() == Role.GUEST_JUDGE) {
            throw new AccessDeniedException("Guest judges cannot be assigned as track mentors.");
        }

        // Validation: only MENTOR role can mentor tracks
        if (mentor.getRole() != Role.MENTOR) {
            throw new IllegalArgumentException(
                "Only users with MENTOR role can be assigned as track mentors. " +
                "User '" + mentor.getUsername() + "' has role: " + mentor.getRole()
            );
        }

        // Idempotency guard: prevent duplicate assignment
        if (trackMentorRepository.existsByTrackIdAndMentorId(trackId, mentorUserId)) {
            throw new IllegalStateException(
                "User '" + mentor.getUsername() + "' is already assigned as mentor for this track."
            );
        }

        User assigner = getCurrentUser();

        TrackMentor assignment = TrackMentor.builder()
                .track(track)
                .mentor(mentor)
                .event(track.getHackathonEvent())
                .assignedBy(assigner)
                .build();

        TrackMentor saved = trackMentorRepository.save(assignment);

        auditLogService.logAction(
            "ASSIGN_TRACK_MENTOR",
            "TRACK",
            trackId,
            null,
            "Assigned mentor " + mentor.getUsername(),
            track.getHackathonEvent().getId()
        );

        return mapToMentorResponse(saved);
    }

    /**
     * Removes a mentor from a track.
     * Organizer can remove a mentor assignment (e.g., conflict resolution).
     */
    @Override
    @Transactional
    public void removeMentor(Long trackId, Long mentorUserId) {
        TrackMentor assignment = trackMentorRepository.findByTrackIdAndMentorId(trackId, mentorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No mentor assignment found for user " + mentorUserId + " on track " + trackId));
        trackMentorRepository.delete(assignment);

        auditLogService.logAction(
            "REMOVE_TRACK_MENTOR",
            "TRACK",
            trackId,
            "Mentor " + assignment.getMentor().getUsername(),
            null,
            assignment.getEvent().getId()
        );
    }

    /**
     * Returns all mentors assigned to a specific track.
     * Used by Organizer UI to see current mentor roster.
     */
    @Override
    public List<TrackMentorResponse> getMentorsByTrack(Long trackId) {
        // Validate track exists
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track not found: " + trackId);
        }
        return trackMentorRepository.findByTrackId(trackId).stream()
                .map(this::mapToMentorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTrack(Long id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found: " + id));

        HackathonEvent event = track.getHackathonEvent();
        
        // Security check
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isOwner = event.getOrganizer() != null && event.getOrganizer().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the organizer or admin can delete this track.");
        }

        // Check if event status is DRAFT
        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Không thể xóa bảng đấu: Chỉ sự kiện ở trạng thái DRAFT mới được phép xóa bảng đấu.");
        }

        trackMentorRepository.deleteByTrackId(id);
        trackRepository.delete(track);

        auditLogService.logAction("DELETE_TRACK", "Track", id, "Track name: " + track.getName(), null, event.getId());
    }

    @Override
    @Transactional
    public TrackResponse updateTrack(Long id, com.example.swp.features.track.dto.request.CreateTrackRequest request) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found: " + id));

        HackathonEvent event = track.getHackathonEvent();

        // Security check
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isOwner = event.getOrganizer() != null && event.getOrganizer().getId().equals(currentUser.getId());
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Only the organizer or admin can update this track.");
        }

        // Check if event status is DRAFT
        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Không thể chỉnh sửa bảng đấu: Chỉ sự kiện ở trạng thái DRAFT mới được phép chỉnh sửa bảng đấu.");
        }

        boolean nameExists = trackRepository.findByHackathonEventId(event.getId()).stream()
                .anyMatch(t -> !t.getId().equals(id) && t.getName().equalsIgnoreCase(request.getName().trim()));
        if (nameExists) {
            throw new com.example.swp.exception.BadRequestException("Bảng đấu với tên này đã tồn tại trong cuộc thi.");
        }

        java.util.Map<String, Object> oldMap = new java.util.HashMap<>();
        oldMap.put("name", track.getName());
        oldMap.put("description", track.getDescription());

        java.util.Map<String, Object> newMap = new java.util.HashMap<>();
        newMap.put("name", request.getName());
        newMap.put("description", request.getDescription());

        String oldValueJson = null;
        String newValueJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            oldValueJson = mapper.writeValueAsString(oldMap);
            newValueJson = mapper.writeValueAsString(newMap);
        } catch (Exception e) {
            // ignore
        }

        track.setName(request.getName());
        track.setDescription(request.getDescription());

        Track updatedTrack = trackRepository.save(track);
        auditLogService.logAction("UPDATE_TRACK", "TRACK", updatedTrack.getId(), oldValueJson, newValueJson, event.getId());
        return mapToResponse(updatedTrack);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private TrackResponse mapToResponse(Track track) {
        return TrackResponse.builder()
                .id(track.getId())
                .name(track.getName())
                .description(track.getDescription())
                .hackathonEventId(track.getHackathonEvent().getId())
                .build();
    }

    private TrackMentorResponse mapToMentorResponse(TrackMentor tm) {
        return TrackMentorResponse.builder()
                .id(tm.getId())
                .trackId(tm.getTrack().getId())
                .trackName(tm.getTrack().getName())
                .mentorId(tm.getMentor().getId())
                .mentorUsername(tm.getMentor().getUsername())
                .mentorFullName(tm.getMentor().getFullName())
                .mentorRole(tm.getMentor().getRole().name())
                .assignedById(tm.getAssignedBy() != null ? tm.getAssignedBy().getId() : null)
                .assignedAt(tm.getAssignedAt())
                .build();
    }
}

