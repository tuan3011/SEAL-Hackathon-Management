package com.example.swp.features.team_invitation;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.exception.BadRequestException;
import com.example.swp.features.notification.NotificationService;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team_invitation.dto.request.InviteMemberRequest;
import com.example.swp.features.team_invitation.dto.response.TeamInvitationResponse;
import com.example.swp.features.team_member.TeamMember;
import com.example.swp.features.team_member.TeamMemberRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.example.swp.features.hackathon_event.HackathonStatus;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TeamInvitationService {

    private final TeamInvitationRepository invitationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final com.example.swp.features.event_registration.EventRegistrationRepository registrationRepository;

    @Transactional
    public TeamInvitationResponse inviteMember(InviteMemberRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User inviter = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Inviter not found"));

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Invitations can only be sent during the registration phase.");
        }

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new com.example.swp.exception.BadRequestException("Cannot invite members to a finalized team.");
        }

        teamMemberRepository.findByTeamIdAndUserId(team.getId(), inviter.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new IllegalStateException("Only the team leader can invite members."));

        User invitee = userRepository.findByEmail(request.getInviteeEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invitee with email " + request.getInviteeEmail() + " not found."));

        if (isUserInAnotherTeamInEvent(invitee, team.getEvent().getId())) {
            throw new IllegalStateException("Invitee is already in another team for this hackathon.");
        }

        if (registrationRepository.findByEventAndUser(team.getEvent(), invitee).isEmpty()) {
            throw new IllegalStateException("Invitee must be registered for this hackathon before they can be invited.");
        }
        
        long currentSize = teamMemberRepository.countByTeamId(team.getId());
        long pendingInvitations = invitationRepository.countByTeamIdAndStatus(team.getId(), InvitationStatus.PENDING);
        if (team.getEvent().getMaxTeamSize() != null && (currentSize + pendingInvitations) >= team.getEvent().getMaxTeamSize()) {
            throw new IllegalStateException("Team capacity reached. Current members + pending invitations exceed the maximum team size.");
        }

        invitationRepository.findByTeamIdAndInviteeEmailAndStatus(team.getId(), request.getInviteeEmail(), InvitationStatus.PENDING).ifPresent(i -> {
            throw new IllegalStateException("A pending invitation has already been sent to this user for this team.");
        });

        TeamInvitation invitation = TeamInvitation.builder()
                .team(team)
                .inviter(inviter)
                .inviteeEmail(request.getInviteeEmail())
                .status(InvitationStatus.PENDING)
                .build();

        TeamInvitation savedInvitation = invitationRepository.save(invitation);
        
        // Create notification
        String title = "Team Invitation";
        String message = inviter.getUsername() + " has invited you to join the team '" + team.getName() + "'.";
        notificationService.createNotification(invitee, title, message, "TEAM_INVITATION", "TeamInvitation", savedInvitation.getId());

        return mapToResponse(savedInvitation);
    }

    @Transactional
    public TeamInvitationResponse respondToInvitation(Long invitationId, InvitationStatus response) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        User invitee = userRepository.findByEmail(invitation.getInviteeEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!invitation.getInviteeEmail().equals(currentUser.getEmail())) {
            throw new IllegalStateException("You are not authorized to respond to this invitation.");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("This invitation has already been responded to or has expired.");
        }

        Team team = invitation.getTeam();

        if (team.getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Invitations can only be responded to during the registration phase.");
        }

        if (response == InvitationStatus.ACCEPTED) {
            
            if (!invitee.isVerified()) {
                throw new IllegalStateException("Your account email must be verified before joining a team.");
            }
            if (!invitee.isApproved()) {
                throw new IllegalStateException("Your account must be approved before joining a team.");
            }
            if (!invitee.isProfileComplete()) {
                throw new com.example.swp.exception.BadRequestException("Please complete your profile before joining a team.");
            }
            if (registrationRepository.findByEventAndUser(team.getEvent(), invitee).isEmpty()) {
                throw new IllegalStateException("You must register for this event before joining a team.");
            }
            
            if (isUserInAnotherTeamInEvent(invitee, team.getEvent().getId())) {
                throw new IllegalStateException("You are already in another team for this hackathon.");
            }
            
            if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), invitee.getId())) {
                throw new BadRequestException("User is already a member of this team");
            }
            
            long currentSize = teamMemberRepository.countByTeamId(team.getId());
            if (team.getEvent().getMaxTeamSize() != null && currentSize >= team.getEvent().getMaxTeamSize()) {
                invitation.setStatus(InvitationStatus.CANCELLED);
                invitationRepository.save(invitation);
                throw new IllegalStateException("Team was full when you tried to accept.");
            }

            invitation.setStatus(InvitationStatus.ACCEPTED);
            
            TeamMember newMember = TeamMember.builder()
                    .team(team)
                    .user(invitee)
                    .isLeader(false)
                    .build();
            teamMemberRepository.save(newMember);
            
            // Notify leader
            String title = "Invitation Accepted";
            String message = currentUser.getUsername() + " has accepted your invitation to join '" + team.getName() + "'.";
            notificationService.createNotification(invitation.getInviter(), title, message, "INVITATION_ACCEPTED", "Team", team.getId());

            cancelOtherPendingInvitations(currentUser.getEmail(), team.getEvent().getId());

        } else if (response == InvitationStatus.DECLINED) {
            invitation.setStatus(InvitationStatus.DECLINED);
             // Notify leader
            String title = "Invitation Declined";
            String message = currentUser.getUsername() + " has declined your invitation to join '" + team.getName() + "'.";
            notificationService.createNotification(invitation.getInviter(), title, message, "INVITATION_DECLINED", "Team", team.getId());
        } else {
            throw new IllegalArgumentException("Invalid response status.");
        }

        TeamInvitation updatedInvitation = invitationRepository.save(invitation);
        return mapToResponse(updatedInvitation);
    }
    
    public List<TeamInvitationResponse> getPendingInvitations() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return invitationRepository.findByInviteeEmailAndStatus(currentUser.getEmail(), InvitationStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeInvitation(Long invitationId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        Team team = invitation.getTeam();
        
        teamMemberRepository.findByTeamIdAndUserId(team.getId(), currentUser.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new IllegalStateException("Only the team leader can revoke invitations."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("Only pending invitations can be revoked.");
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);

        userRepository.findByEmail(invitation.getInviteeEmail()).ifPresent(invitee -> {
            String title = "Invitation Revoked";
            String message = currentUser.getUsername() + " has revoked your invitation to join the team '" + team.getName() + "'.";
            notificationService.createNotification(invitee, title, message, "TEAM_INVITATION_REVOKED", "TeamInvitation", invitation.getId());
        });
    }

    public List<TeamInvitationResponse> getSentInvitations(Long teamId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        teamMemberRepository.findByTeamIdAndUserId(team.getId(), currentUser.getId())
                .filter(tm -> tm.isLeader())
                .orElseThrow(() -> new IllegalStateException("Only the team leader can view sent invitations."));

        return invitationRepository.findByTeamId(teamId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private boolean isUserInAnotherTeamInEvent(User user, Long eventId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(user.getId());
        return memberships.stream().anyMatch(m -> m.getTeam().getEvent().getId().equals(eventId));
    }
    
    private void cancelOtherPendingInvitations(String userEmail, Long eventId) {
        List<TeamInvitation> pendingInvitations = invitationRepository.findByInviteeEmailAndStatus(userEmail, InvitationStatus.PENDING);
        for (TeamInvitation inv : pendingInvitations) {
            if (inv.getTeam().getEvent().getId().equals(eventId)) {
                inv.setStatus(InvitationStatus.CANCELLED);
                invitationRepository.save(inv);
            }
        }
    }

    private TeamInvitationResponse mapToResponse(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .teamId(invitation.getTeam().getId())
                .teamName(invitation.getTeam().getName())
                .inviterId(invitation.getInviter().getId())
                .inviterName(invitation.getInviter().getUsername())
                .inviteeEmail(invitation.getInviteeEmail())
                .status(invitation.getStatus())
                .createdAt(invitation.getCreatedAt())
                .build();
    }
}
