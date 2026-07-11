package com.example.swp.features.team_invitation.dto.response;

import com.example.swp.features.team_invitation.InvitationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamInvitationResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long inviterId;
    private String inviterName;
    private String inviteeEmail;
    private InvitationStatus status;
    private LocalDateTime createdAt;

    public static TeamInvitationResponseBuilder builder() { return new TeamInvitationResponseBuilder(); }
    public static class TeamInvitationResponseBuilder {
        private Long id;
        private Long teamId;
        private String teamName;
        private Long inviterId;
        private String inviterName;
        private String inviteeEmail;
        private InvitationStatus status;
        private LocalDateTime createdAt;
        public TeamInvitationResponseBuilder id(Long id) { this.id = id; return this; }
        public TeamInvitationResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TeamInvitationResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public TeamInvitationResponseBuilder inviterId(Long inviterId) { this.inviterId = inviterId; return this; }
        public TeamInvitationResponseBuilder inviterName(String inviterName) { this.inviterName = inviterName; return this; }
        public TeamInvitationResponseBuilder inviteeEmail(String inviteeEmail) { this.inviteeEmail = inviteeEmail; return this; }
        public TeamInvitationResponseBuilder status(InvitationStatus status) { this.status = status; return this; }
        public TeamInvitationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TeamInvitationResponse build() {
            TeamInvitationResponse t = new TeamInvitationResponse();
            t.id = this.id; t.teamId = this.teamId; t.teamName = this.teamName;
            t.inviterId = this.inviterId; t.inviterName = this.inviterName;
            t.inviteeEmail = this.inviteeEmail; t.status = this.status;
            t.createdAt = this.createdAt;
            return t;
        }
    }
}


