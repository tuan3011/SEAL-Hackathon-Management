package com.example.swp.features.mentorship_request;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.mentorship_request.dto.request.CreateMentorshipRequest;
import com.example.swp.features.mentorship_request.dto.response.MentorshipRequestResponse;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.Role;
import com.example.swp.features.track.TrackMentorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MentorshipRequestServiceImpl implements MentorshipRequestService {

    private final MentorshipRequestRepository requestRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final TrackMentorRepository trackMentorRepository;

    @Transactional
    public MentorshipRequestResponse createRequest(CreateMentorshipRequest request) {
        User currentUser = getCurrentUser();
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        teamMemberRepository.findByTeamIdAndUserId(team.getId(), currentUser.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new AccessDeniedException("Only the team leader can request mentorship."));

        if (team.getStatus() != com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new IllegalStateException("Your team must be finalized before requesting mentorship.");
        }

        if (team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot request mentorship when the event is completed or cancelled.");
        }

        MentorshipRequest newRequest = MentorshipRequest.builder()
                .team(team)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(MentorshipRequestStatus.OPEN)
                .build();
        
        MentorshipRequest savedRequest = requestRepository.save(newRequest);

        // Notify all available mentors
        List<User> mentors = userRepository.findByRole(Role.MENTOR);
        if (!mentors.isEmpty()) {
            notificationService.createNotifications(
                mentors, 
                "New Mentorship Request", 
                "Team '" + team.getName() + "' has requested mentorship.", 
                "MENTORSHIP_REQUEST", 
                "MentorshipRequest", 
                savedRequest.getId()
            );
        }

        return mapToResponse(savedRequest);
    }

    @Transactional
    public MentorshipRequestResponse acceptRequest(Long requestId) {
        User mentor = getCurrentUser();

        // Explicit block: Guest Judges are external reviewers only, not mentors.
        if (mentor.getRole() == Role.GUEST_JUDGE) {
            throw new AccessDeniedException("Guest judges cannot accept mentorship requests.");
        }
        // Internal judges (JUDGE role) CAN be mentors on different tracks – allow them.
        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.JUDGE) {
            throw new AccessDeniedException("Only mentors can accept requests.");
        }

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        if (request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot accept mentorship request when the event is completed or cancelled.");
        }

        if (request.getStatus() != MentorshipRequestStatus.OPEN) {
            throw new IllegalStateException("This request is no longer open.");
        }

        if (request.getTeam().getTrack() != null) {
            boolean isAssignedToTrack = trackMentorRepository.existsByTrackIdAndMentorId(
                    request.getTeam().getTrack().getId(), mentor.getId());
            if (!isAssignedToTrack) {
                throw new AccessDeniedException("You are not assigned to the track of this team.");
            }
        }

        request.setMentor(mentor);
        request.setStatus(MentorshipRequestStatus.IN_PROGRESS);
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        // Notify team leader
        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Accepted",
                "Mentor " + mentor.getUsername() + " has accepted your request.",
                "MENTORSHIP_ACCEPTED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }
    
    @Transactional
    public MentorshipRequestResponse resolveRequest(Long requestId, com.example.swp.features.mentorship_request.dto.request.ResolveMentorshipRequest payload) {
        User currentUser = getCurrentUser();
        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        boolean isMentorOfRequest = request.getMentor() != null && request.getMentor().getId().equals(currentUser.getId());

        if (!isMentorOfRequest) {
            throw new AccessDeniedException("Only the assigned mentor can resolve this request.");
        }

        if (request.getStatus() != MentorshipRequestStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only requests in progress can be resolved.");
        }

        if (request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot resolve mentorship request when the event is completed or cancelled.");
        }

        request.setStatus(MentorshipRequestStatus.RESOLVED);
        request.setResolvedAt(LocalDateTime.now());
        request.setAnswer(payload.getAnswer());
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null && isMentorOfRequest) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Request Resolved",
                "Mentor " + currentUser.getUsername() + " has sent an answer: " + payload.getAnswer(),
                "MENTORSHIP_RESOLVED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }

    @Transactional
    public MentorshipRequestResponse rejectRequest(Long requestId, com.example.swp.features.mentorship_request.dto.request.RejectMentorshipRequest payload) {
        User mentor = getCurrentUser();

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        if (request.getStatus() != MentorshipRequestStatus.OPEN) {
            throw new IllegalStateException("Only open requests can be declined.");
        }

        if (request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot decline mentorship request when the event is completed or cancelled.");
        }

        request.setStatus(MentorshipRequestStatus.REJECTED);
        request.setMentor(mentor); // Record who rejected it
        request.setRejectReason(payload.getReason());
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Request Declined",
                "Mentor " + mentor.getUsername() + " has declined your request. Reason: " + payload.getReason(),
                "MENTORSHIP_REJECTED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }

    @Transactional
    public void cancelRequest(Long requestId) {
        User currentUser = getCurrentUser();
        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        boolean isLeaderOfTeam = findTeamLeader(request.getTeam()).getId().equals(currentUser.getId());
        if (!isLeaderOfTeam && currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.ORGANIZER) {
            throw new AccessDeniedException("Only the team leader or an admin can cancel this request.");
        }

        if (request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel mentorship request when the event is completed or cancelled.");
        }

        if (request.getStatus() != MentorshipRequestStatus.OPEN) {
            throw new IllegalStateException("Only open requests can be cancelled.");
        }

        request.setStatus(MentorshipRequestStatus.CANCELLED);
        requestRepository.save(request);
    }

    @Transactional
    public MentorshipRequestResponse releaseRequest(Long requestId) {
        User mentor = getCurrentUser();

        MentorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));

        if (request.getStatus() != MentorshipRequestStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress requests can be released.");
        }

        if (request.getMentor() == null || !request.getMentor().getId().equals(mentor.getId())) {
            throw new AccessDeniedException("Only the assigned mentor can release this request.");
        }

        if (request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            request.getTeam().getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot release mentorship request when the event is completed or cancelled.");
        }

        request.setMentor(null);
        request.setStatus(MentorshipRequestStatus.OPEN);
        
        MentorshipRequest updatedRequest = requestRepository.save(request);

        User teamLeader = findTeamLeader(request.getTeam());
        if (teamLeader != null) {
            notificationService.createNotification(
                teamLeader,
                "Mentorship Request Released",
                "Mentor " + mentor.getUsername() + " has released your request. It is now open for other mentors.",
                "MENTORSHIP_RELEASED",
                "MentorshipRequest",
                updatedRequest.getId()
            );
        }

        return mapToResponse(updatedRequest);
    }

    public List<MentorshipRequestResponse> getOpenRequests() {
        User currentUser = getCurrentUser();
        List<MentorshipRequest> openRequests = requestRepository.findByStatus(MentorshipRequestStatus.OPEN);

        List<Long> assignedTrackIds = trackMentorRepository.findByMentorId(currentUser.getId())
                .stream()
                .map(tm -> tm.getTrack().getId())
                .collect(Collectors.toList());

        return openRequests.stream()
            .filter(r -> r.getTeam().getTrack() != null && assignedTrackIds.contains(r.getTeam().getTrack().getId()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public MentorshipRequestResponse getRequestById(Long id) {
        MentorshipRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship request not found"));
        return mapToResponse(request);
    }
    
    public List<MentorshipRequestResponse> getMyMentorshipRequests() {
        User currentUser = getCurrentUser();
        // Internal mentors and internal judges who can also mentor
        if (currentUser.getRole() == Role.MENTOR || currentUser.getRole() == Role.JUDGE) {
            return requestRepository.findByMentorId(currentUser.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
        }
        if (currentUser.getRole() == Role.PARTICIPANT) {
            User participant = getCurrentUser();
            List<TeamMember> memberships = teamMemberRepository.findByUserId(participant.getId());
            if (memberships.isEmpty()) {
                throw new ResourceNotFoundException("You are not in any team.");
            }
            return memberships.stream()
                .map(m -> m.getTeam().getId())
                .flatMap(teamId -> requestRepository.findByTeamId(teamId).stream())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        }
        return List.of();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private User findTeamLeader(Team team) {
        return team.getTeamMembers().stream()
            .filter(TeamMember::isLeader)
            .map(TeamMember::getUser)
            .findFirst()
            .orElse(null);
    }

    private MentorshipRequestResponse mapToResponse(MentorshipRequest request) {
        return MentorshipRequestResponse.builder()
                .id(request.getId())
                .teamId(request.getTeam().getId())
                .teamName(request.getTeam().getName())
                .mentorId(request.getMentor() != null ? request.getMentor().getId() : null)
                .mentorName(request.getMentor() != null ? request.getMentor().getUsername() : null)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .answer(request.getAnswer())
                .rejectReason(request.getRejectReason())
                .trackName(request.getTeam().getTrack() != null ? request.getTeam().getTrack().getName() : null)
                .build();
    }
}
