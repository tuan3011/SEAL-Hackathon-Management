package com.example.swp.features.notification.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String referenceType;
    private Long referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponseBuilder builder() { return new NotificationResponseBuilder(); }
    public static class NotificationResponseBuilder {
        private Long id;
        private String title;
        private String message;
        private String type;
        private String referenceType;
        private Long referenceId;
        private boolean isRead;
        private LocalDateTime createdAt;
        public NotificationResponseBuilder id(Long id) { this.id = id; return this; }
        public NotificationResponseBuilder title(String title) { this.title = title; return this; }
        public NotificationResponseBuilder message(String message) { this.message = message; return this; }
        public NotificationResponseBuilder type(String type) { this.type = type; return this; }
        public NotificationResponseBuilder referenceType(String referenceType) { this.referenceType = referenceType; return this; }
        public NotificationResponseBuilder referenceId(Long referenceId) { this.referenceId = referenceId; return this; }
        public NotificationResponseBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public NotificationResponse build() {
            NotificationResponse n = new NotificationResponse();
            n.id = this.id; n.title = this.title; n.message = this.message; n.type = this.type;
            n.referenceType = this.referenceType; n.referenceId = this.referenceId;
            n.isRead = this.isRead; n.createdAt = this.createdAt;
            return n;
        }
    }
}


