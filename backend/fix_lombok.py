import os
import re

files_to_fix = {
    r"backend\src\main\java\com\example\swp\features\user\User.java": """
    // Manual Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getFptStudentId() { return fptStudentId; }
    public void setFptStudentId(String fptStudentId) { this.fptStudentId = fptStudentId; }
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
""",
    r"backend\src\main\java\com\example\swp\features\score\Score.java": """
    // Manual Getters and Setters
    public com.example.swp.features.criterion.Criterion getCriterion() { return criterion; }
    public int getScoreValue() { return scoreValue; }
""",
    r"backend\src\main\java\com\example\swp\features\round\dto\request\CreateRoundRequest.java": """
    // Manual Getters and Setters
    public Long getHackathonEventId() { return hackathonEventId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public java.time.LocalDateTime getStartTime() { return startTime; }
    public java.time.LocalDateTime getEndTime() { return endTime; }
""",
    r"backend\src\main\java\com\example\swp\features\round\Round.java": """
    // Manual Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public java.time.LocalDateTime getStartTime() { return startTime; }
    public java.time.LocalDateTime getEndTime() { return endTime; }
    public com.example.swp.features.hackathon_event.HackathonEvent getHackathonEvent() { return hackathonEvent; }

    public static RoundBuilder builder() { return new RoundBuilder(); }
    public static class RoundBuilder {
        private Long id;
        private String name;
        private String description;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
        private com.example.swp.features.hackathon_event.HackathonEvent hackathonEvent;

        public RoundBuilder id(Long id) { this.id = id; return this; }
        public RoundBuilder name(String name) { this.name = name; return this; }
        public RoundBuilder description(String description) { this.description = description; return this; }
        public RoundBuilder startTime(java.time.LocalDateTime startTime) { this.startTime = startTime; return this; }
        public RoundBuilder endTime(java.time.LocalDateTime endTime) { this.endTime = endTime; return this; }
        public RoundBuilder hackathonEvent(com.example.swp.features.hackathon_event.HackathonEvent hackathonEvent) { this.hackathonEvent = hackathonEvent; return this; }
        public Round build() { 
            Round r = new Round(); 
            r.id = this.id; r.name = this.name; r.description = this.description; 
            r.startTime = this.startTime; r.endTime = this.endTime; r.hackathonEvent = this.hackathonEvent; 
            return r; 
        }
    }
""",
    r"backend\src\main\java\com\example\swp\features\round\dto\response\RoundResponse.java": """
    // Manual Builder
    public static RoundResponseBuilder builder() { return new RoundResponseBuilder(); }
    public static class RoundResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
        private Long hackathonEventId;

        public RoundResponseBuilder id(Long id) { this.id = id; return this; }
        public RoundResponseBuilder name(String name) { this.name = name; return this; }
        public RoundResponseBuilder description(String description) { this.description = description; return this; }
        public RoundResponseBuilder startTime(java.time.LocalDateTime startTime) { this.startTime = startTime; return this; }
        public RoundResponseBuilder endTime(java.time.LocalDateTime endTime) { this.endTime = endTime; return this; }
        public RoundResponseBuilder hackathonEventId(Long hackathonEventId) { this.hackathonEventId = hackathonEventId; return this; }
        public RoundResponse build() {
            RoundResponse r = new RoundResponse();
            r.id = this.id; r.name = this.name; r.description = this.description;
            r.startTime = this.startTime; r.endTime = this.endTime; r.hackathonEventId = this.hackathonEventId;
            return r;
        }
    }
""",
    r"backend\src\main\java\com\example\swp\security\service\UserDetailsImpl.java": """
    // Manual constructor and getters
    public UserDetailsImpl() {}
    public UserDetailsImpl(com.example.swp.features.user.User user) { this.user = user; }
    public com.example.swp.features.user.User getUser() { return user; }
""",
    r"backend\src\main\java\com\example\swp\features\user\dto\request\CreateUserRequest.java": """
    // Manual Getters
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
""",
    r"backend\src\main\java\com\example\swp\features\criterion\Criterion.java": """
    // Manual Getters
    public int getWeight() { return weight; }
    public Long getId() { return id; }
"""
}

base_dir = r"D:\IT_FPT\SUMMER26\SWP391-Project"

for rel_path, methods in files_to_fix.items():
    full_path = os.path.join(base_dir, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if we already injected them
        if "// Manual Getters" in content or "// Manual Builder" in content or "public static RoundBuilder builder" in content:
            print(f"Skipping {rel_path} - already patched")
            continue
            
        # Find the last closing brace
        last_brace_index = content.rfind('}')
        if last_brace_index != -1:
            new_content = content[:last_brace_index] + methods + content[last_brace_index:]
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched {rel_path}")
        else:
            print(f"Could not find closing brace in {rel_path}")
    else:
        print(f"File not found: {rel_path}")
