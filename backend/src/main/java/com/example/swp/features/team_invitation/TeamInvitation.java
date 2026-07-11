package com.example.swp.features.team_invitation;

import com.example.swp.features.team.Team;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "team_invitation")
public class TeamInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;

    @Column(name = "invitee_email", nullable = false)
    private String inviteeEmail;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InvitationStatus status = InvitationStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    public Long getId() { return id; }
    public Team getTeam() { return team; }
    public User getInviter() { return inviter; }
    public String getInviteeEmail() { return inviteeEmail; }
    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static TeamInvitationBuilder builder() { return new TeamInvitationBuilder(); }
    public static class TeamInvitationBuilder {
        private Long id;
        private Team team;
        private User inviter;
        private String inviteeEmail;
        private InvitationStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
        public TeamInvitationBuilder id(Long id) { this.id = id; return this; }
        public TeamInvitationBuilder team(Team team) { this.team = team; return this; }
        public TeamInvitationBuilder inviter(User inviter) { this.inviter = inviter; return this; }
        public TeamInvitationBuilder inviteeEmail(String inviteeEmail) { this.inviteeEmail = inviteeEmail; return this; }
        public TeamInvitationBuilder status(InvitationStatus status) { this.status = status; return this; }
        public TeamInvitationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TeamInvitationBuilder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public TeamInvitation build() {
            TeamInvitation t = new TeamInvitation();
            t.id = this.id; t.team = this.team; t.inviter = this.inviter;
            t.inviteeEmail = this.inviteeEmail; t.status = this.status;
            t.createdAt = this.createdAt; t.expiresAt = this.expiresAt;
            return t;
        }
    }
}
