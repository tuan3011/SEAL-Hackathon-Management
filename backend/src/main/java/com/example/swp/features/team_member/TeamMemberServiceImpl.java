package com.example.swp.features.team_member;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.team_member.dto.request.AddTeamMemberRequest;
import com.example.swp.features.team_member.dto.response.TeamMemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.example.swp.features.hackathon_event.HackathonStatus;
import com.example.swp.features.audit_log.AuditLogService;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    public TeamMemberResponse addTeamMember(AddTeamMemberRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new com.example.swp.exception.BadRequestException("Cannot modify members in a disqualified team.");
        }

        if (team.getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Team modifications are only allowed during the registration phase.");
        }

        // Check if user is already in the team
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), user.getId())) {
            throw new IllegalStateException("User is already a member of this team.");
        }

        // Check team size limit from the event settings
        long currentSize = teamMemberRepository.countByTeamId(team.getId());
        if (team.getEvent().getMaxTeamSize() != null && currentSize >= team.getEvent().getMaxTeamSize()) {
            throw new IllegalStateException("Team is full. Cannot add more members.");
        }

        // Check if user is already in another team for this event
        List<TeamMember> userMemberships = teamMemberRepository.findByUserId(user.getId());
        boolean inAnotherTeam = userMemberships.stream().anyMatch(m -> 
            m.getTeam().getEvent().getId().equals(team.getEvent().getId()) 
            && !m.getTeam().getId().equals(team.getId())
        );
        
        if (inAnotherTeam) {
            throw new IllegalStateException("User is already in another team for this hackathon event.");
        }
        TeamMember newTeamMember = TeamMember.builder()
                .team(team)
                .user(user)
                .isLeader(request.isLeader())
                .build();

        TeamMember savedTeamMember = teamMemberRepository.save(newTeamMember);
        return mapToResponse(savedTeamMember);
    }

    @Override
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void removeTeamMember(Long teamMemberId) {
        TeamMember member = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Team member not found"));
                
        if (member.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new com.example.swp.exception.BadRequestException("Cannot modify members in a disqualified team.");
        }

        if (member.getTeam().getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Team modifications are only allowed during the registration phase.");
        }
        
        Team team = member.getTeam();
        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            long currentSize = teamMemberRepository.countByTeamId(team.getId());
            Integer minSize = team.getEvent().getMinTeamSize();
            if (minSize != null && (currentSize - 1) < minSize) {
                throw new com.example.swp.exception.BadRequestException("Cannot remove member: Team is finalized and would fall below the minimum team size.");
            }
        }
        
        teamMemberRepository.deleteById(teamMemberId);
    }

    private User getCurrentUser() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void kickMember(Long userId, Long teamId) {
        User currentUser = getCurrentUser();
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new com.example.swp.exception.BadRequestException("Cannot modify members in a disqualified team.");
        }

        if (team.getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Team modifications are only allowed during the registration phase.");
        }

        boolean isCurrentUserAdmin = currentUser.getRole() == com.example.swp.features.user.Role.ADMIN || currentUser.getRole() == com.example.swp.features.user.Role.ORGANIZER;
        boolean isCurrentUserLeader = teamMemberRepository.existsByTeamIdAndUserIdAndIsLeaderTrue(teamId, currentUser.getId());

        if (!isCurrentUserAdmin && !isCurrentUserLeader) {
            throw new com.example.swp.exception.BadRequestException("Only Team Leader or Admin can kick members");
        }

        if (currentUser.getId().equals(userId)) {
            throw new com.example.swp.exception.BadRequestException("Leader cannot kick themselves");
        }

        TeamMember memberToKick = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("User is not a member of this team"));

        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            if (!isCurrentUserAdmin) {
                throw new com.example.swp.exception.BadRequestException("Cannot kick member from a finalized team.");
            } else {
                auditLogService.logAction("FORCE_KICK_MEMBER", "TEAM", team.getId(), null, "Admin " + currentUser.getUsername() + " forced member removal on FINALIZED team");
            }
        }

        // Explicitly remove from parent collection to prevent Hibernate cascade re-saving and trigger orphanRemoval
        if (team.getTeamMembers() != null) {
            team.getTeamMembers().remove(memberToKick);
        }
        teamMemberRepository.delete(memberToKick);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void leaveTeam(Long teamId) {
        User currentUser = getCurrentUser();

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this team"));

        if (member.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new com.example.swp.exception.BadRequestException("Cannot leave a disqualified team.");
        }

        if (member.getTeam().getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Team modifications are only allowed during the registration phase.");
        }

        if (member.isLeader()) {
            throw new com.example.swp.exception.BadRequestException("Leader cannot leave the team without transferring leadership first");
        }

        Team team = member.getTeam();
        if (team.getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new com.example.swp.exception.BadRequestException("Cannot leave a finalized team.");
        }

        teamMemberRepository.delete(member);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void transferLeadership(com.example.swp.features.team_member.dto.request.TransferLeadershipRequest request) {
        User currentUser = getCurrentUser();

        TeamMember currentLeader = teamMemberRepository.findByTeamIdAndUserId(request.getTeamId(), currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this team"));

        if (currentLeader.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
            throw new com.example.swp.exception.BadRequestException("Cannot transfer leadership in a disqualified team.");
        }

        if (currentLeader.getTeam().getEvent().getStatus() != HackathonStatus.PUBLISHED) {
            throw new com.example.swp.exception.BadRequestException("Team modifications are only allowed during the registration phase.");
        }

        if (!currentLeader.isLeader()) {
            throw new com.example.swp.exception.BadRequestException("Only the current leader can transfer leadership");
        }

        if (currentLeader.getTeam().getStatus() == com.example.swp.features.team.TeamStatus.FINALIZED) {
            throw new com.example.swp.exception.BadRequestException("Cannot transfer leadership in a finalized team.");
        }

        TeamMember newLeader = teamMemberRepository.findByTeamIdAndUserId(request.getTeamId(), request.getNewLeaderUserId())
                .orElseThrow(() -> new ResourceNotFoundException("New leader is not a member of this team"));

        currentLeader.setLeader(false);
        newLeader.setLeader(true);

        teamMemberRepository.save(currentLeader);
        teamMemberRepository.save(newLeader);
    }

    private TeamMemberResponse mapToResponse(TeamMember teamMember) {
        return TeamMemberResponse.builder()
                .id(teamMember.getId())
                .teamId(teamMember.getTeam().getId())
                .userId(teamMember.getUser().getId())
                .username(teamMember.getUser().getUsername())
                .isLeader(teamMember.isLeader())
                .build();
    }
}
