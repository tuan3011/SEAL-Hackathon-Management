package com.example.swp.features.mentorship_request.dto.response;

import com.example.swp.features.mentorship_request.MentorshipRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class MentorshipRequestResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long mentorId;
    private String mentorName;
    private String title;
    private String description;
    private MentorshipRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String answer;
    private String rejectReason;
    private String trackName;

    public static MentorshipRequestResponseBuilder builder() { return new MentorshipRequestResponseBuilder(); }
    public static class MentorshipRequestResponseBuilder {
        private Long id;
        private Long teamId;
        private String teamName;
        private Long mentorId;
        private String mentorName;
        private String title;
        private String description;
        private MentorshipRequestStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime resolvedAt;
        private String answer;
        private String rejectReason;
        private String trackName;

        public MentorshipRequestResponseBuilder id(Long id) { this.id = id; return this; }
        public MentorshipRequestResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public MentorshipRequestResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public MentorshipRequestResponseBuilder mentorId(Long mentorId) { this.mentorId = mentorId; return this; }
        public MentorshipRequestResponseBuilder mentorName(String mentorName) { this.mentorName = mentorName; return this; }
        public MentorshipRequestResponseBuilder title(String title) { this.title = title; return this; }
        public MentorshipRequestResponseBuilder description(String description) { this.description = description; return this; }
        public MentorshipRequestResponseBuilder status(MentorshipRequestStatus status) { this.status = status; return this; }
        public MentorshipRequestResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public MentorshipRequestResponseBuilder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public MentorshipRequestResponseBuilder answer(String answer) { this.answer = answer; return this; }
        public MentorshipRequestResponseBuilder rejectReason(String rejectReason) { this.rejectReason = rejectReason; return this; }
        public MentorshipRequestResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }

        public MentorshipRequestResponse build() {
            MentorshipRequestResponse m = new MentorshipRequestResponse();
            m.id = this.id; m.teamId = this.teamId; m.teamName = this.teamName;
            m.mentorId = this.mentorId; m.mentorName = this.mentorName;
            m.title = this.title; m.description = this.description; m.status = this.status;
            m.createdAt = this.createdAt; m.resolvedAt = this.resolvedAt;
            m.answer = this.answer; m.rejectReason = this.rejectReason;
            m.trackName = this.trackName;
            return m;
        }
    }
}


