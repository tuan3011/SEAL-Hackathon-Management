package com.example.swp.features.mentorship_request;

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
@Table(name = "mentorship_request")
public class MentorshipRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private MentorshipRequestStatus status = MentorshipRequestStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(columnDefinition = "TEXT")
    private String rejectReason;

    @Version
    private Integer version;

    public Long getId() { return id; }
    public Team getTeam() { return team; }
    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public MentorshipRequestStatus getStatus() { return status; }
    public void setStatus(MentorshipRequestStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public static MentorshipRequestBuilder builder() { return new MentorshipRequestBuilder(); }
    public static class MentorshipRequestBuilder {
        private Long id;
        private Team team;
        private User mentor;
        private String title;
        private String description;
        private MentorshipRequestStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime resolvedAt;
        private String answer;
        private String rejectReason;

        public MentorshipRequestBuilder id(Long id) { this.id = id; return this; }
        public MentorshipRequestBuilder team(Team team) { this.team = team; return this; }
        public MentorshipRequestBuilder mentor(User mentor) { this.mentor = mentor; return this; }
        public MentorshipRequestBuilder title(String title) { this.title = title; return this; }
        public MentorshipRequestBuilder description(String description) { this.description = description; return this; }
        public MentorshipRequestBuilder status(MentorshipRequestStatus status) { this.status = status; return this; }
        public MentorshipRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MentorshipRequestBuilder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public MentorshipRequestBuilder answer(String answer) { this.answer = answer; return this; }
        public MentorshipRequestBuilder rejectReason(String rejectReason) { this.rejectReason = rejectReason; return this; }
        public MentorshipRequest build() {
            MentorshipRequest m = new MentorshipRequest();
            m.id = this.id; m.team = this.team; m.mentor = this.mentor;
            m.title = this.title; m.description = this.description; m.status = this.status;
            m.createdAt = this.createdAt; m.resolvedAt = this.resolvedAt;
            m.answer = this.answer; m.rejectReason = this.rejectReason;
            return m;
        }
    }
}
