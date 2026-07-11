package com.example.swp.features.hackathon_event;

import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.request.UpdateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HackathonEventService {
    HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request);
    Page<HackathonEventResponse> getAllHackathonEvents(Pageable pageable);
    Page<HackathonEventResponse> getAllEventsForAdmin(Pageable pageable);
    List<HackathonEventResponse> getMyHackathonEvents();
    HackathonEventResponse getHackathonEventBySlug(String slug);
    HackathonEventResponse updateHackathonEvent(Long id, UpdateHackathonEventRequest request);
    void deleteHackathonEvent(Long id);
    HackathonEventResponse updateHackathonEventStatus(Long id, HackathonStatus newStatus);
    HackathonEventResponse getHackathonEventById(Long id);
    HackathonEventResponse cloneEvent(Long id);
    com.example.swp.features.hackathon_event.dto.response.HackathonEventAnalyticsResponse getEventAnalytics(Long eventId);
}
