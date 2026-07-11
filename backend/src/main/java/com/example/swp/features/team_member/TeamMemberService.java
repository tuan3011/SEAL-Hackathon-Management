package com.example.swp.features.team_member;

import com.example.swp.features.team_member.dto.request.AddTeamMemberRequest;
import com.example.swp.features.team_member.dto.response.TeamMemberResponse;

import java.util.List;

public interface TeamMemberService {
    TeamMemberResponse addTeamMember(AddTeamMemberRequest request);
    List<TeamMemberResponse> getTeamMembers(Long teamId);
    void removeTeamMember(Long teamMemberId);
    void kickMember(Long userId, Long teamId);
    void leaveTeam(Long teamId);
    void transferLeadership(com.example.swp.features.team_member.dto.request.TransferLeadershipRequest request);
}
