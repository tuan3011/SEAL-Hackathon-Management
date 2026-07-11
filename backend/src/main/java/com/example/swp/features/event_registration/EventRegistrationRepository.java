package com.example.swp.features.event_registration;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventAndUser(HackathonEvent event, User user);
    List<EventRegistration> findByEventId(Long eventId);
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
