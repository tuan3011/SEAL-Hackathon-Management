package com.example.swp.features.audit_log.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String details;
    private LocalDateTime createdAt;
    private String oldValue;
    private String newValue;

    public static AuditLogResponseBuilder builder() { return new AuditLogResponseBuilder(); }
    public static class AuditLogResponseBuilder {
        private Long id;
        private Long userId;
        private String username;
        private String action;
        private String details;
        private LocalDateTime createdAt;
        private String oldValue;
        private String newValue;

        public AuditLogResponseBuilder id(Long id) { this.id = id; return this; }
        public AuditLogResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public AuditLogResponseBuilder username(String username) { this.username = username; return this; }
        public AuditLogResponseBuilder action(String action) { this.action = action; return this; }
        public AuditLogResponseBuilder details(String details) { this.details = details; return this; }
        public AuditLogResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AuditLogResponseBuilder oldValue(String oldValue) { this.oldValue = oldValue; return this; }
        public AuditLogResponseBuilder newValue(String newValue) { this.newValue = newValue; return this; }

        public AuditLogResponse build() {
            AuditLogResponse r = new AuditLogResponse();
            r.id = this.id; r.userId = this.userId; r.username = this.username;
            r.action = this.action; r.details = this.details; r.createdAt = this.createdAt;
            r.oldValue = this.oldValue; r.newValue = this.newValue;
            return r;
        }
    }
}


