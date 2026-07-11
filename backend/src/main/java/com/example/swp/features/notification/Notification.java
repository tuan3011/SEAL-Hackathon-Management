package com.example.swp.features.notification;

import com.example.swp.features.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type;

    private String referenceType;

    private Long referenceId;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public String getReferenceType() { return referenceType; }
    public Long getReferenceId() { return referenceId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }
    public static class NotificationBuilder {
        private Long id;
        private User user;
        private String title;
        private String message;
        private String type;
        private String referenceType;
        private Long referenceId;
        private boolean isRead;
        private LocalDateTime createdAt;
        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }
        public NotificationBuilder referenceType(String referenceType) { this.referenceType = referenceType; return this; }
        public NotificationBuilder referenceId(Long referenceId) { this.referenceId = referenceId; return this; }
        public NotificationBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Notification build() {
            Notification n = new Notification();
            n.id = this.id; n.user = this.user; n.title = this.title; n.message = this.message;
            n.type = this.type; n.referenceType = this.referenceType; n.referenceId = this.referenceId;
            n.isRead = this.isRead; n.createdAt = this.createdAt;
            return n;
        }
    }
}
