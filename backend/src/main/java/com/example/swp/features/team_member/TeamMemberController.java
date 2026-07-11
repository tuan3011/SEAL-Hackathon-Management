package com.example.swp.features.team_member;

import com.example.swp.features.team_member.dto.request.AddTeamMemberRequest;
import com.example.swp.features.team_member.dto.response.TeamMemberResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/team-members")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<TeamMemberResponse>> addTeamMember(@Valid @RequestBody AddTeamMemberRequest request) {
        TeamMemberResponse response = teamMemberService.addTeamMember(request);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Team member added."), HttpStatus.CREATED);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<TeamMemberResponse>>> getTeamMembers(@PathVariable Long teamId) {
        List<TeamMemberResponse> responses = teamMemberService.getTeamMembers(teamId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @DeleteMapping("/{teamMemberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> removeTeamMember(@PathVariable Long teamMemberId) {
        teamMemberService.removeTeamMember(teamMemberId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Team member removed."));
    }

    @DeleteMapping("/{userId}/kick/{teamId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> kickMember(@PathVariable Long userId, @PathVariable Long teamId) {
        teamMemberService.kickMember(userId, teamId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Member kicked successfully."));
    }

    @PostMapping("/leave/{teamId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> leaveTeam(@PathVariable Long teamId) {
        teamMemberService.leaveTeam(teamId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Successfully left the team."));
    }

    @PutMapping("/transfer-leadership")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> transferLeadership(@Valid @RequestBody com.example.swp.features.team_member.dto.request.TransferLeadershipRequest request) {
        teamMemberService.transferLeadership(request);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Leadership transferred successfully."));
    }
}