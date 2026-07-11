package com.example.swp.features.track.dto.response;

import java.time.LocalDateTime;

/**
 * Response DTO for a track-mentor assignment.
 * Follows the project's manual builder pattern.
 */
public class TrackMentorResponse {

    private Long id;
    private Long trackId;
    private String trackName;
    private Long mentorId;
    private String mentorUsername;
    private String mentorFullName;
    private String mentorRole;
    private Long assignedById;
    private LocalDateTime assignedAt;

    public TrackMentorResponse() {}

    public Long getId() { return id; }
    public Long getTrackId() { return trackId; }
    public String getTrackName() { return trackName; }
    public Long getMentorId() { return mentorId; }
    public String getMentorUsername() { return mentorUsername; }
    public String getMentorFullName() { return mentorFullName; }
    public String getMentorRole() { return mentorRole; }
    public Long getAssignedById() { return assignedById; }
    public LocalDateTime getAssignedAt() { return assignedAt; }

    public static TrackMentorResponseBuilder builder() { return new TrackMentorResponseBuilder(); }

    public static class TrackMentorResponseBuilder {
        private Long id;
        private Long trackId;
        private String trackName;
        private Long mentorId;
        private String mentorUsername;
        private String mentorFullName;
        private String mentorRole;
        private Long assignedById;
        private LocalDateTime assignedAt;

        public TrackMentorResponseBuilder id(Long id) { this.id = id; return this; }
        public TrackMentorResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public TrackMentorResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public TrackMentorResponseBuilder mentorId(Long mentorId) { this.mentorId = mentorId; return this; }
        public TrackMentorResponseBuilder mentorUsername(String mentorUsername) { this.mentorUsername = mentorUsername; return this; }
        public TrackMentorResponseBuilder mentorFullName(String mentorFullName) { this.mentorFullName = mentorFullName; return this; }
        public TrackMentorResponseBuilder mentorRole(String mentorRole) { this.mentorRole = mentorRole; return this; }
        public TrackMentorResponseBuilder assignedById(Long assignedById) { this.assignedById = assignedById; return this; }
        public TrackMentorResponseBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public TrackMentorResponse build() {
            TrackMentorResponse r = new TrackMentorResponse();
            r.id = this.id; r.trackId = this.trackId; r.trackName = this.trackName;
            r.mentorId = this.mentorId; r.mentorUsername = this.mentorUsername;
            r.mentorFullName = this.mentorFullName; r.mentorRole = this.mentorRole;
            r.assignedById = this.assignedById; r.assignedAt = this.assignedAt;
            return r;
        }
    }
}
