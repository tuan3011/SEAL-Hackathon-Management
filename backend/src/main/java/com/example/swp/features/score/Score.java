package com.example.swp.features.score;

import com.example.swp.features.criterion.Criterion;
import com.example.swp.features.submission.Submission;
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
@Table(name = "score", uniqueConstraints = {
    // Each judge can only score a submission's criterion once
    @UniqueConstraint(columnNames = {"judge_id", "submission_id", "criterion_id"})
})
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criterion_id", nullable = false)
    private Criterion criterion;

    @Column(name = "score_value", nullable = false)
    private int scoreValue;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Builder.Default
    private boolean isFinalized = false;

    @CreationTimestamp
    @Column(name = "scored_at", updatable = false)
    private LocalDateTime scoredAt;
    public Criterion getCriterion() { return criterion; }
    public int getScoreValue() { return scoreValue; }
    public Submission getSubmission() { return submission; }
    public User getJudge() { return judge; }
    public boolean isFinalized() { return isFinalized; }
    public Long getId() { return id; }
    public String getComment() { return comment; }
    public LocalDateTime getScoredAt() { return scoredAt; }
    public void setSubmission(Submission submission) { this.submission = submission; }
    public void setJudge(User judge) { this.judge = judge; }
    public void setCriterion(Criterion criterion) { this.criterion = criterion; }
    public void setScoreValue(int scoreValue) { this.scoreValue = scoreValue; }
    public void setScoredAt(LocalDateTime scoredAt) { this.scoredAt = scoredAt; }
    public void setComment(String comment) { this.comment = comment; }
}
