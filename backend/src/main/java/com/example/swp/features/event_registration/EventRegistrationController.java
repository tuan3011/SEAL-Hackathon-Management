package com.example.swp.features.event_registration;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.event_registration.dto.response.EventRegistrationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/event-registrations")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService eventRegistrationService;

    @PostMapping

    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> registerForEvent(@RequestParam Long eventId) {
        EventRegistrationResponse response = eventRegistrationService.registerForEvent(eventId);
        return new ResponseEntity<>(ApiResponse.success(response, "Successfully registered for the event."),
                HttpStatus.CREATED);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> getRegistrationsForEvent(
            @PathVariable Long eventId) {
        List<EventRegistrationResponse> responses = eventRegistrationService.getRegistrationsForEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/my-registration/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> checkMyRegistration(@PathVariable Long eventId) {
        boolean isRegistered = eventRegistrationService.isUserRegisteredForEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success(isRegistered));
    }
}
