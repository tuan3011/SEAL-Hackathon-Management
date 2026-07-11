package com.example.swp.features.submission;

import com.example.swp.features.round.Round;
import com.example.swp.features.team.Team;
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
@Table(name = "submission")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(name = "repository_url")
    private String repositoryUrl;

    @Column(name = "demo_url")
    private String demoUrl;

    @Column(name = "report_url")
    private String reportUrl;

    @Column(name = "version")
    private int version;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
    
    public Long getId() { return id; }
    public Team getTeam() { return team; }
    public Round getRound() { return round; }
    public String getDemoUrl() { return demoUrl; }
    public String getReportUrl() { return reportUrl; }
    public int getVersion() { return version; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setVersion(int version) { this.version = version; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }
    public void setReportUrl(String reportUrl) { this.reportUrl = reportUrl; }
    public String getRepositoryUrl() { return repositoryUrl; }

    public static SubmissionBuilder builder() { return new SubmissionBuilder(); }
    public static class SubmissionBuilder {
        private Long id;
        private Team team;
        private Round round;
        private String repositoryUrl;
        private String demoUrl;
        private String reportUrl;
        private int version;
        private LocalDateTime submittedAt;

        public SubmissionBuilder id(Long id) { this.id = id; return this; }
        public SubmissionBuilder team(Team team) { this.team = team; return this; }
        public SubmissionBuilder round(Round round) { this.round = round; return this; }
        public SubmissionBuilder repositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; return this; }
        public SubmissionBuilder demoUrl(String demoUrl) { this.demoUrl = demoUrl; return this; }
        public SubmissionBuilder reportUrl(String reportUrl) { this.reportUrl = reportUrl; return this; }
        public SubmissionBuilder version(int version) { this.version = version; return this; }
        public SubmissionBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }

        public Submission build() {
            Submission s = new Submission();
            s.id = this.id; s.team = this.team; s.round = this.round;
            s.repositoryUrl = this.repositoryUrl; s.demoUrl = this.demoUrl;
            s.reportUrl = this.reportUrl; s.version = this.version;
            s.submittedAt = this.submittedAt;
            return s;
        }
    }
}