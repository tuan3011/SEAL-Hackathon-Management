package com.example.swp.features.hackathon_event;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.request.UpdateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventAnalyticsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hackathon-events")
@RequiredArgsConstructor
public class HackathonEventController {

    private final HackathonEventService hackathonEventService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> createHackathonEvent(@Valid @RequestBody CreateHackathonEventRequest request) {
        HackathonEventResponse response = hackathonEventService.createHackathonEvent(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Hackathon event created successfully."), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HackathonEventResponse>>> getAllHackathonEvents(Pageable pageable) {
        Page<HackathonEventResponse> responses = hackathonEventService.getAllHackathonEvents(pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<HackathonEventResponse>>> getAllEventsForAdmin(Pageable pageable) {
        Page<HackathonEventResponse> responses = hackathonEventService.getAllEventsForAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<List<HackathonEventResponse>>> getMyHackathonEvents() {
        List<HackathonEventResponse> responses = hackathonEventService.getMyHackathonEvents();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> getHackathonEventBySlug(@PathVariable String slug) {
        HackathonEventResponse response = hackathonEventService.getHackathonEventBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> getHackathonEventById(@PathVariable Long id) {
        HackathonEventResponse response = hackathonEventService.getHackathonEventById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> updateHackathonEvent(@PathVariable Long id, @Valid @RequestBody UpdateHackathonEventRequest request) {
        HackathonEventResponse response = hackathonEventService.updateHackathonEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Hackathon event updated successfully."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> deleteHackathonEvent(@PathVariable Long id) {
        hackathonEventService.deleteHackathonEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Hackathon event deleted successfully."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> updateHackathonEventStatus(@PathVariable Long id, @RequestParam HackathonStatus status) {
        HackathonEventResponse response = hackathonEventService.updateHackathonEventStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Hackathon event status updated successfully."));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<HackathonEventResponse>> cloneEvent(@PathVariable Long id) {
        HackathonEventResponse response = hackathonEventService.cloneEvent(id);
        return new ResponseEntity<>(ApiResponse.success(response, "Hackathon event cloned successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<HackathonEventAnalyticsResponse>> getEventAnalytics(@PathVariable Long id) {
        HackathonEventAnalyticsResponse response = hackathonEventService.getEventAnalytics(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
