package com.example.swp.features.hackathon_event.event;

import com.example.swp.features.ranking.dto.TeamRankingResponse;

import java.util.List;

/**
 * Application Event: được publish khi HackathonEvent chuyển sang trạng thái COMPLETED.
 *
 * Đây là POJO thuần — KHÔNG phải JPA Entity, KHÔNG phải Spring Bean.
 * Chỉ mang data (eventId, eventName, top3Rankings) để truyền từ Service → Listener.
 *
 * QUAN TRỌNG: Không truyền JPA Entity vào đây vì listener chạy trên thread khác,
 * Entity sẽ bị detached → LazyInitializationException.
 */
public class HackathonCompletedEvent {

    private final Long eventId;
    private final String eventName;
    private final List<TeamRankingResponse> top3Rankings;

    public HackathonCompletedEvent(Long eventId, String eventName, List<TeamRankingResponse> top3Rankings) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.top3Rankings = top3Rankings;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public List<TeamRankingResponse> getTop3Rankings() {
        return top3Rankings;
    }
}
