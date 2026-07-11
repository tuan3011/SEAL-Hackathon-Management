package com.example.swp.features.judge_assignment;

import com.example.swp.features.round.Round;
import com.example.swp.features.track.Track;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "judge_assignment")
public class JudgeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_organizer_id")
    private User organizer;

    @Enumerated(EnumType.STRING)
    private JudgeAssignmentStatus status = JudgeAssignmentStatus.ASSIGNED;

    private java.time.LocalDateTime assignedAt;

    public Long getId() { return id; }
    public User getJudge() { return judge; }
    public Round getRound() { return round; }
    public Track getTrack() { return track; }
    public JudgeAssignmentStatus getStatus() { return status; }
    public java.time.LocalDateTime getAssignedAt() { return assignedAt; }

    public static JudgeAssignmentBuilder builder() { return new JudgeAssignmentBuilder(); }
    public static class JudgeAssignmentBuilder {
        private Long id;
        private User judge;
        private Round round;
        private Track track;
        private User organizer;
        private JudgeAssignmentStatus status;
        private java.time.LocalDateTime assignedAt;

        public JudgeAssignmentBuilder id(Long id) { this.id = id; return this; }
        public JudgeAssignmentBuilder judge(User judge) { this.judge = judge; return this; }
        public JudgeAssignmentBuilder round(Round round) { this.round = round; return this; }
        public JudgeAssignmentBuilder track(Track track) { this.track = track; return this; }
        public JudgeAssignmentBuilder organizer(User organizer) { this.organizer = organizer; return this; }
        public JudgeAssignmentBuilder status(JudgeAssignmentStatus status) { this.status = status; return this; }
        public JudgeAssignmentBuilder assignedAt(java.time.LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public JudgeAssignment build() {
            JudgeAssignment j = new JudgeAssignment();
            j.id = this.id; j.judge = this.judge; j.round = this.round; j.track = this.track;
            j.organizer = this.organizer; j.status = this.status; j.assignedAt = this.assignedAt;
            return j;
        }
    }
}