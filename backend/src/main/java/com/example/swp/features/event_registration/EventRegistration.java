package com.example.swp.features.event_registration;

import com.example.swp.features.hackathon_event.HackathonEvent;
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
@Table(name = "event_registration", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"event_id", "user_id"})
})
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private EventRegistrationStatus status = EventRegistrationStatus.REGISTERED;

    @CreationTimestamp
    private LocalDateTime registeredAt;

    public Long getId() { return id; }
    public HackathonEvent getEvent() { return event; }
    public User getUser() { return user; }
    public EventRegistrationStatus getStatus() { return status; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }

    public static EventRegistrationBuilder builder() { return new EventRegistrationBuilder(); }
    public static class EventRegistrationBuilder {
        private Long id;
        private HackathonEvent event;
        private User user;
        private EventRegistrationStatus status = EventRegistrationStatus.REGISTERED;
        private LocalDateTime registeredAt;

        public EventRegistrationBuilder id(Long id) { this.id = id; return this; }
        public EventRegistrationBuilder event(HackathonEvent event) { this.event = event; return this; }
        public EventRegistrationBuilder user(User user) { this.user = user; return this; }
        public EventRegistrationBuilder status(EventRegistrationStatus status) { this.status = status; return this; }
        public EventRegistrationBuilder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this; }

        public EventRegistration build() {
            EventRegistration er = new EventRegistration();
            er.id = this.id; er.event = this.event; er.user = this.user;
            er.status = this.status; er.registeredAt = this.registeredAt;
            return er;
        }
    }
}
