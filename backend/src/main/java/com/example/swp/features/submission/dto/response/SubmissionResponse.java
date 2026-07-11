package com.example.swp.features.submission.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long roundId;
    private String roundName;
    private String repositoryUrl;
    private String demoUrl;
    private String reportUrl;
    private LocalDateTime submittedAt;
    private int version;
    private Long trackId;
    private String trackName;
    private Long eventId;

    public static SubmissionResponseBuilder builder() { return new SubmissionResponseBuilder(); }
    public static class SubmissionResponseBuilder {
        private Long id;
        private Long teamId;
        private String teamName;
        private Long roundId;
        private String roundName;
        private String repositoryUrl;
        private String demoUrl;
        private String reportUrl;
        private LocalDateTime submittedAt;
        private int version;
        private Long trackId;
        private String trackName;
        private Long eventId;

        public SubmissionResponseBuilder id(Long id) { this.id = id; return this; }
        public SubmissionResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public SubmissionResponseBuilder teamName(String teamName) { this.teamName = teamName; return this; }
        public SubmissionResponseBuilder roundId(Long roundId) { this.roundId = roundId; return this; }
        public SubmissionResponseBuilder roundName(String roundName) { this.roundName = roundName; return this; }
        public SubmissionResponseBuilder repositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; return this; }
        public SubmissionResponseBuilder demoUrl(String demoUrl) { this.demoUrl = demoUrl; return this; }
        public SubmissionResponseBuilder reportUrl(String reportUrl) { this.reportUrl = reportUrl; return this; }
        public SubmissionResponseBuilder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public SubmissionResponseBuilder version(int version) { this.version = version; return this; }
        public SubmissionResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public SubmissionResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public SubmissionResponseBuilder eventId(Long eventId) { this.eventId = eventId; return this; }

        public SubmissionResponse build() {
            return new SubmissionResponse(id, teamId, teamName, roundId, roundName, repositoryUrl, demoUrl, reportUrl, submittedAt, version, trackId, trackName, eventId);
        }
    }
}


