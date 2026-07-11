package com.example.swp.features.track;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents the assignment of a Mentor/Internal Judge to a Track.
 * Business rule: A user assigned as mentor to a track CANNOT judge
 * submissions belonging to that same track (conflict of interest).
 * Guest judges (Role.GUEST_JUDGE) are never allowed to be track mentors.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "track_mentor", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"track_id", "user_id"}, name = "uq_track_mentor")
})
public class TrackMentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User mentor;

    /** Denormalized for fast lookups – derived from track.hackathonEvent */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private User assignedBy;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    // ── Manual getters (follow project style – no Lombok getter generation) ──

    public Long getId() { return id; }
    public Track getTrack() { return track; }
    public User getMentor() { return mentor; }
    public HackathonEvent getEvent() { return event; }
    public User getAssignedBy() { return assignedBy; }
    public LocalDateTime getAssignedAt() { return assignedAt; }

    // ── Builder (follow project style – manual builder, not Lombok @Builder) ──

    public static TrackMentorBuilder builder() { return new TrackMentorBuilder(); }

    public static class TrackMentorBuilder {
        private Track track;
        private User mentor;
        private HackathonEvent event;
        private User assignedBy;

        public TrackMentorBuilder track(Track track) { this.track = track; return this; }
        public TrackMentorBuilder mentor(User mentor) { this.mentor = mentor; return this; }
        public TrackMentorBuilder event(HackathonEvent event) { this.event = event; return this; }
        public TrackMentorBuilder assignedBy(User assignedBy) { this.assignedBy = assignedBy; return this; }

        public TrackMentor build() {
            TrackMentor tm = new TrackMentor();
            tm.track = this.track;
            tm.mentor = this.mentor;
            tm.event = this.event;
            tm.assignedBy = this.assignedBy;
            return tm;
        }
    }
}
