package com.example.swp.features.event_registration.dto.response;

import com.example.swp.features.event_registration.EventRegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class EventRegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventName;
    private Long userId;
    private String username;
    private EventRegistrationStatus status;
    private LocalDateTime registeredAt;

    public static EventRegistrationResponseBuilder builder() { return new EventRegistrationResponseBuilder(); }
    public static class EventRegistrationResponseBuilder {
        private Long id;
        private Long eventId;
        private String eventName;
        private Long userId;
        private String username;
        private EventRegistrationStatus status;
        private LocalDateTime registeredAt;

        public EventRegistrationResponseBuilder id(Long id) { this.id = id; return this; }
        public EventRegistrationResponseBuilder eventId(Long eventId) { this.eventId = eventId; return this; }
        public EventRegistrationResponseBuilder eventName(String eventName) { this.eventName = eventName; return this; }
        public EventRegistrationResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public EventRegistrationResponseBuilder username(String username) { this.username = username; return this; }
        public EventRegistrationResponseBuilder status(EventRegistrationStatus status) { this.status = status; return this; }
        public EventRegistrationResponseBuilder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this; }

        public EventRegistrationResponse build() {
            EventRegistrationResponse e = new EventRegistrationResponse();
            e.id = this.id; e.eventId = this.eventId; e.eventName = this.eventName;
            e.userId = this.userId; e.username = this.username; e.status = this.status;
            e.registeredAt = this.registeredAt;
            return e;
        }
    }
}


