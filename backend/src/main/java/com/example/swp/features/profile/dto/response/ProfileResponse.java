package com.example.swp.features.profile.dto.response;

import com.example.swp.features.user.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String fullName;
    private String phone;
    private String fptStudentId;
    private String schoolName;
    private String githubUrl;
    private String bio;
    private String avatarUrl;

    public static ProfileResponseBuilder builder() { return new ProfileResponseBuilder(); }
    public static class ProfileResponseBuilder {
        private Long id;
        private String username;
        private String email;
        private Role role;
        private String fullName;
        private String phone;
        private String fptStudentId;
        private String schoolName;
        private String githubUrl;
        private String bio;
        private String avatarUrl;

        public ProfileResponseBuilder id(Long id) { this.id = id; return this; }
        public ProfileResponseBuilder username(String username) { this.username = username; return this; }
        public ProfileResponseBuilder email(String email) { this.email = email; return this; }
        public ProfileResponseBuilder role(Role role) { this.role = role; return this; }
        public ProfileResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public ProfileResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public ProfileResponseBuilder fptStudentId(String fptStudentId) { this.fptStudentId = fptStudentId; return this; }
        public ProfileResponseBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
        public ProfileResponseBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public ProfileResponseBuilder bio(String bio) { this.bio = bio; return this; }
        public ProfileResponseBuilder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }

        public ProfileResponse build() {
            ProfileResponse r = new ProfileResponse();
            r.id = this.id; r.username = this.username; r.email = this.email;
            r.role = this.role; r.fullName = this.fullName; r.phone = this.phone;
            r.fptStudentId = this.fptStudentId; r.schoolName = this.schoolName;
            r.githubUrl = this.githubUrl; r.bio = this.bio; r.avatarUrl = this.avatarUrl;
            return r;
        }
    }
}


