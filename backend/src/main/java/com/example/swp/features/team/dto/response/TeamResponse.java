package com.example.swp.features.team.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamResponse {
    private Long id;
    private String name;
    private String projectName;
    private String projectDescription;
    private Long trackId;

    private Long eventId;
    private String trackName;
    private String status;
    private java.util.List<TeamMemberInfo> members;
    private java.math.BigDecimal finalScore;

    @Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TeamMemberInfo {
        private Long userId;
        private String username;
        @com.fasterxml.jackson.annotation.JsonProperty("isLeader")
        private boolean isLeader;
        
        public static TeamMemberInfoBuilder builder() { return new TeamMemberInfoBuilder(); }
        public static class TeamMemberInfoBuilder {
            private Long userId;
            private String username;
            @com.fasterxml.jackson.annotation.JsonProperty("isLeader")
            private boolean isLeader;
            public TeamMemberInfoBuilder userId(Long userId) { this.userId = userId; return this; }
            public TeamMemberInfoBuilder username(String username) { this.username = username; return this; }
            public TeamMemberInfoBuilder isLeader(boolean isLeader) { this.isLeader = isLeader; return this; }
            public TeamMemberInfo build() {
                TeamMemberInfo t = new TeamMemberInfo();
                t.userId = this.userId; t.username = this.username; t.isLeader = this.isLeader;
                return t;
            }
        }
    }

    public static TeamResponseBuilder builder() { return new TeamResponseBuilder(); }
    public static class TeamResponseBuilder {
        private Long id;
        private String name;
        private String projectName;
        private String projectDescription;
        private Long trackId;
        private Long eventId;
        private String trackName;
        private String status;
        private java.util.List<TeamMemberInfo> members;
        private java.math.BigDecimal finalScore;

        public TeamResponseBuilder id(Long id) { this.id = id; return this; }
        public TeamResponseBuilder name(String name) { this.name = name; return this; }
        public TeamResponseBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public TeamResponseBuilder projectDescription(String projectDescription) { this.projectDescription = projectDescription; return this; }
        public TeamResponseBuilder trackId(Long trackId) { this.trackId = trackId; return this; }
        public TeamResponseBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public TeamResponseBuilder trackName(String trackName) { this.trackName = trackName; return this; }
        public TeamResponseBuilder status(String status) { this.status = status; return this; }
        public TeamResponseBuilder members(java.util.List<TeamMemberInfo> members) { this.members = members; return this; }
        public TeamResponseBuilder finalScore(java.math.BigDecimal finalScore) { this.finalScore = finalScore; return this; }
        public TeamResponse build() {
            TeamResponse r = new TeamResponse();
            r.id = this.id; r.name = this.name; r.projectName = this.projectName;
            r.projectDescription = this.projectDescription; r.trackId = this.trackId;
            r.eventId = this.eventId; r.trackName = this.trackName; r.status = this.status; 
            r.members = this.members; r.finalScore = this.finalScore;
            return r;
        }
    }
}
