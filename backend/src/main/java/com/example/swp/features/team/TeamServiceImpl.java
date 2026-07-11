package com.example.swp.features.team;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.event_registration.EventRegistrationRepository;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.DisqualifyTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final HackathonEventRepository eventRepository;
    private final TrackRepository trackRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final com.example.swp.features.mentorship_request.MentorshipRequestRepository mentorshipRequestRepository;
    private final com.example.swp.features.team_invitation.TeamInvitationRepository teamInvitationRepository;
    private final com.example.swp.features.submission.SubmissionRepository submissionRepository;

    @Override
    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        HackathonEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (event.isDeleted()) {
            throw new ResourceNotFoundException("Hackathon event not found");
        }

        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED) {
            throw new IllegalStateException("Teams can only be created when the hackathon is PUBLISHED (registration is open).");
        }

        if (event.getEndTime() != null && LocalDateTime.now().isAfter(event.getEndTime())) {
            throw new IllegalStateException("The event has ended. You can no longer create teams.");
        }
                
        Track track = trackRepository.findById(request.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found"));

        if (!track.getHackathonEvent().getId().equals(event.getId())) {
            throw new com.example.swp.exception.BadRequestException("Track does not belong to this event");
        }

        // Check if user is registered for the event
        registrationRepository.findByEventAndUser(event, currentUser)
                .orElseThrow(() -> new IllegalStateException("You must be registered for the event to create a team."));

        if (!currentUser.isProfileComplete()) {
            throw new com.example.swp.exception.BadRequestException("Please complete your profile before participating.");
        }

        // Business Rule: One team per hackathon (Task 2.4)
        if (isUserInAnotherTeamInEvent(currentUser, event.getId())) {
            throw new IllegalStateException("You are already in a team for this hackathon.");
        }

        Team team = Team.builder()
                .name(request.getName())
                .event(event)
                .track(track)
                .status(TeamStatus.ACTIVE)
                .build();
        Team savedTeam = teamRepository.save(team);
        
        auditLogService.logAction("CREATE_TEAM", "Team", savedTeam.getId(), null, "Created team: " + savedTeam.getName(), event.getId());

        TeamMember leader = TeamMember.builder()
                .team(savedTeam)
                .user(currentUser)
                .isLeader(true)
                .build();
        teamMemberRepository.save(leader);
        
        // Refresh team members from DB
        savedTeam.setTeamMembers(teamMemberRepository.findByTeamId(savedTeam.getId()));

        return mapToResponse(savedTeam);
    }

    @Override
    public TeamResponse getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        return mapToResponse(team);
    }

    @Override
    public org.springframework.data.domain.Page<TeamResponse> getAllTeams(org.springframework.data.domain.Pageable pageable) {
        return teamRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<TeamResponse> getTeamsByTrack(Long trackId) {
        return teamRepository.findByTrackId(trackId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamResponse> getTeamsByEvent(Long eventId) {
        return teamRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TeamResponse getMyTeamForEvent(Long eventId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeamMember membership = teamMemberRepository.findByUserId(currentUser.getId()).stream()
                .filter(m -> m.getTeam().getEvent().getId().equals(eventId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Team not found for this event"));
        
        return mapToResponse(membership.getTeam());
    }
    
    @Override
    @Transactional
    public void disqualifyTeam(Long teamId, DisqualifyTeamRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getStatus() == TeamStatus.DISQUALIFIED) {
            throw new IllegalStateException("Team is already disqualified");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        team.setStatus(TeamStatus.DISQUALIFIED);
        team.setDisqualificationReason(request.getReason());
        team.setDisqualifiedAt(LocalDateTime.now());
        team.setDisqualifiedBy(currentUser);

        teamRepository.save(team);

        auditLogService.logAction(
                "DISQUALIFY_TEAM",
                "TEAM",
                team.getId(),
                "ACTIVE",
                String.format("Team '%s' DISQUALIFIED by %s. Reason: %s", 
                        team.getName(), currentUser.getUsername(), request.getReason()),
                team.getEvent().getId()
        );

        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());
        for (TeamMember member : members) {
            notificationService.createNotification(
                    member.getUser(),
                    "Team Disqualified",
                    "Your team '" + team.getName() + "' has been disqualified. Reason: " + request.getReason(),
                    "TEAM_DISQUALIFIED",
                    "TEAM",
                    team.getId()
            );
        }
    }

    @Override
    @Transactional
    public TeamResponse updateTeam(Long teamId, com.example.swp.features.team.dto.request.UpdateTeamRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot edit team details when the event is completed or cancelled.");
        }

        boolean isCurrentUserAdmin = currentUser.getRole() == com.example.swp.features.user.Role.ADMIN || currentUser.getRole() == com.example.swp.features.user.Role.ORGANIZER;

        if (team.getEvent().getEndTime() != null && LocalDateTime.now().isAfter(team.getEvent().getEndTime()) && !isCurrentUserAdmin) {
            throw new IllegalStateException("The event has ended. You can no longer update team details.");
        }

        boolean isCurrentUserLeader = teamMemberRepository.existsByTeamIdAndUserIdAndIsLeaderTrue(teamId, currentUser.getId());

        if (!isCurrentUserAdmin && !isCurrentUserLeader) {
            throw new com.example.swp.exception.BadRequestException("Only Team Leader or Admin can edit team details");
        }

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED && !isCurrentUserAdmin) {
            throw new com.example.swp.exception.BadRequestException("Cannot modify team details after team finalization.");
        }

        if (request.getName() != null) team.setName(request.getName());
        if (request.getProjectName() != null) team.setProjectName(request.getProjectName());
        if (request.getProjectDescription() != null) team.setProjectDescription(request.getProjectDescription());
        
        if (request.getTrackId() != null) {
            Long currentTrackId = team.getTrack() != null ? team.getTrack().getId() : null;
            if (!request.getTrackId().equals(currentTrackId)) {
                if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
                    if (!isCurrentUserAdmin) {
                        throw new com.example.swp.exception.BadRequestException("Cannot change track after team finalization.");
                    } else {
                        auditLogService.logAction("FORCE_CHANGE_TRACK", "TEAM", team.getId(), null, "Admin " + currentUser.getUsername() + " forced track change on FINALIZED team", team.getEvent().getId());
                    }
                }
                
                Track track = trackRepository.findById(request.getTrackId())
                        .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
                if (!track.getHackathonEvent().getId().equals(team.getEvent().getId())) {
                    throw new com.example.swp.exception.BadRequestException("Track does not belong to this event");
                }
                team.setTrack(track);
            }
        }

        Team updatedTeam = teamRepository.save(team);
        
        auditLogService.logAction("UPDATE_TEAM", "TEAM", updatedTeam.getId(), null, "Team updated by " + currentUser.getUsername(), updatedTeam.getEvent().getId());
        
        return mapToResponse(updatedTeam);
    }

    @Override
    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        
        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new com.example.swp.exception.BadRequestException("Finalized teams cannot be deleted. Please use disqualify instead.");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean isCurrentUserAdmin = currentUser.getRole() == com.example.swp.features.user.Role.ADMIN || currentUser.getRole() == com.example.swp.features.user.Role.ORGANIZER;

        if (team.getEvent().getEndTime() != null && LocalDateTime.now().isAfter(team.getEvent().getEndTime()) && !isCurrentUserAdmin) {
            throw new IllegalStateException("The event has ended. You can no longer delete teams.");
        }
        
        List<com.example.swp.features.mentorship_request.MentorshipRequest> requests = mentorshipRequestRepository.findByTeamId(teamId);
        mentorshipRequestRepository.deleteAll(requests);
        
        List<com.example.swp.features.team_invitation.TeamInvitation> invitations = teamInvitationRepository.findByTeamId(teamId);
        teamInvitationRepository.deleteAll(invitations);
        
        List<com.example.swp.features.submission.Submission> submissions = submissionRepository.findByTeamId(teamId);
        submissionRepository.deleteAll(submissions);
        
        teamRepository.delete(team);

        auditLogService.logAction("DELETE_TEAM", "TEAM", teamId, "DELETED", "Team '" + team.getName() + "' deleted by " + currentUsername, team.getEvent().getId());
    }

    @Override
    @Transactional
    public TeamResponse finalizeTeam(Long teamId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED ||
            team.getEvent().getStatus() == com.example.swp.features.hackathon_event.HackathonStatus.CANCELLED) {
            throw new IllegalStateException("Cannot finalize team when the event is completed or cancelled.");
        }

        if (team.getEvent().getEndTime() != null && LocalDateTime.now().isAfter(team.getEvent().getEndTime())) {
            throw new IllegalStateException("The event has ended. You can no longer finalize teams.");
        }

        boolean isCurrentUserLeader = teamMemberRepository.existsByTeamIdAndUserIdAndIsLeaderTrue(teamId, currentUser.getId());
        if (!isCurrentUserLeader) {
            throw new com.example.swp.exception.BadRequestException("Only the Team Leader can finalize the team.");
        }

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new com.example.swp.exception.BadRequestException("Team is already finalized.");
        }

        long currentSize = teamMemberRepository.countByTeamId(team.getId());
        Integer minSize = team.getEvent().getMinTeamSize();
        if (minSize != null && currentSize < minSize) {
            throw new com.example.swp.exception.BadRequestException("Your team needs at least " + minSize + " members before participating.");
        }
        
        Integer maxSize = team.getEvent().getMaxTeamSize();
        if (maxSize != null && currentSize > maxSize) {
            throw new com.example.swp.exception.BadRequestException("Your team exceeds the maximum allowed members.");
        }

        team.setStatus(TeamStatus.FINALIZED);
        Team updatedTeam = teamRepository.save(team);
        
        auditLogService.logAction("FINALIZE_TEAM", "TEAM", team.getId(), null, "Team finalized by " + currentUser.getUsername(), updatedTeam.getEvent().getId());
        
        return mapToResponse(updatedTeam);
    }

    private boolean isUserInAnotherTeamInEvent(User user, Long eventId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(user.getId());
        return memberships.stream().anyMatch(m -> m.getTeam().getEvent().getId().equals(eventId));
    }

    private TeamResponse mapToResponse(Team team) {
        // This mapping can be improved with a dedicated mapper class
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .projectName(team.getProjectName())
                .projectDescription(team.getProjectDescription())
                .eventId(team.getEvent().getId())
                .trackId(team.getTrack() != null ? team.getTrack().getId() : null)
                .trackName(team.getTrack() != null ? team.getTrack().getName() : null)
                .status(team.getStatus().name())
                .members(team.getTeamMembers() != null ? team.getTeamMembers().stream().map(tm -> 
                    TeamResponse.TeamMemberInfo.builder()
                        .userId(tm.getUser().getId())
                        .username(tm.getUser().getUsername())
                        .isLeader(tm.isLeader())
                        .build()
                ).collect(Collectors.toList()) : null)
                .finalScore(team.getFinalScore())
                .build();
    }
}
