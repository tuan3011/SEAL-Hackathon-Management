package com.example.swp.features.team_member.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class TeamMemberResponse {
    private Long id;
    private Long teamId;
    private Long userId;
    private String username; // To show user's name in response
    private boolean isLeader;

    public static TeamMemberResponseBuilder builder() { return new TeamMemberResponseBuilder(); }
    public static class TeamMemberResponseBuilder {
        private Long id;
        private Long teamId;
        private Long userId;
        private String username;
        private boolean isLeader;

        public TeamMemberResponseBuilder id(Long id) { this.id = id; return this; }
        public TeamMemberResponseBuilder teamId(Long teamId) { this.teamId = teamId; return this; }
        public TeamMemberResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public TeamMemberResponseBuilder username(String username) { this.username = username; return this; }
        public TeamMemberResponseBuilder isLeader(boolean isLeader) { this.isLeader = isLeader; return this; }

        public TeamMemberResponse build() {
            TeamMemberResponse r = new TeamMemberResponse();
            r.id = this.id; r.teamId = this.teamId; r.userId = this.userId;
            r.username = this.username; r.isLeader = this.isLeader;
            return r;
        }
    }
}


