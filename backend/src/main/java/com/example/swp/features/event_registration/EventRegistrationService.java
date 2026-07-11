package com.example.swp.features.event_registration;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.event_registration.dto.response.EventRegistrationResponse;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.hackathon_event.HackathonStatus;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventRegistrationResponse registerForEvent(Long eventId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // User phải đã xác thực email
        if (!currentUser.isVerified()) {
            throw new IllegalStateException("You must verify your email before registering for an event.");
        }

        // User phải đã được admin duyệt
        if (!currentUser.isApproved()) {
            throw new IllegalStateException("Your account must be approved before registering for an event.");
        }

        if (!currentUser.isProfileComplete()) {
            throw new com.example.swp.exception.BadRequestException(
                    "Please complete your profile before registering for this event.");
        }

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (event.isDeleted()) {
            throw new ResourceNotFoundException("Hackathon event not found");
        }

        // Event phải ở trạng thái PUBLISHED mới cho phép đăng ký
        if (event.getStatus() != HackathonStatus.PUBLISHED) {
            throw new IllegalStateException(
                    "Registration for this event is not open. Current status: " + event.getStatus());
        }

        // Check registration window
        LocalDateTime now = LocalDateTime.now();
        if (event.getRegistrationStart() != null && now.isBefore(event.getRegistrationStart())) {
            throw new IllegalStateException("Registration has not started yet.");
        }
        if (event.getRegistrationEnd() != null && now.isAfter(event.getRegistrationEnd())) {
            throw new IllegalStateException("The registration deadline has passed.");
        }

        eventRegistrationRepository.findByEventAndUser(event, currentUser).ifPresent(registration -> {
            throw new IllegalStateException("User is already registered for this event.");
        });

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .user(currentUser)
                .status(EventRegistrationStatus.REGISTERED)
                .build();

        EventRegistration savedRegistration = eventRegistrationRepository.save(registration);
        return mapToResponse(savedRegistration);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getRegistrationsForEvent(Long eventId) {
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventId(eventId);
        return registrations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isUserRegisteredForEvent(Long eventId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        return eventRegistrationRepository.findByEventAndUser(event, currentUser).isPresent();
    }

    private EventRegistrationResponse mapToResponse(EventRegistration registration) {
        return EventRegistrationResponse.builder()
                .id(registration.getId())
                .eventId(registration.getEvent().getId())
                .eventName(registration.getEvent().getName())
                .userId(registration.getUser().getId())
                .username(registration.getUser().getUsername())
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .build();
    }
}
