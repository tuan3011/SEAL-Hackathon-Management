package com.example.swp.features.team_invitation;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.team_invitation.dto.request.InviteMemberRequest;
import com.example.swp.features.team_invitation.dto.request.RespondToInvitationRequest;
import com.example.swp.features.team_invitation.dto.response.TeamInvitationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/team-invitations")
@RequiredArgsConstructor
public class TeamInvitationController {

    private final TeamInvitationService invitationService;

    @PostMapping
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> inviteMember(@Valid @RequestBody InviteMemberRequest request) {
        TeamInvitationResponse response = invitationService.inviteMember(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Invitation sent successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<List<TeamInvitationResponse>>> getPendingInvitations() {
        List<TeamInvitationResponse> responses = invitationService.getPendingInvitations();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{invitationId}/respond")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> respondToInvitation(
            @PathVariable Long invitationId,
            @Valid @RequestBody RespondToInvitationRequest request) {
        TeamInvitationResponse response = invitationService.respondToInvitation(invitationId, request.getResponse());
        return ResponseEntity.ok(ApiResponse.success(response, "Successfully responded to the invitation."));
    }

    @DeleteMapping("/{invitationId}/revoke")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<Void>> revokeInvitation(@PathVariable Long invitationId) {
        invitationService.revokeInvitation(invitationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Invitation revoked successfully."));
    }

    @GetMapping("/team/{teamId}/sent")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<List<TeamInvitationResponse>>> getSentInvitations(@PathVariable Long teamId) {
        List<TeamInvitationResponse> responses = invitationService.getSentInvitations(teamId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
