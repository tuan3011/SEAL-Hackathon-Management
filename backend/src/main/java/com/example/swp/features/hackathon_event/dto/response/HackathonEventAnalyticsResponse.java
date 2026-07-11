package com.example.swp.features.hackathon_event.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HackathonEventAnalyticsResponse {
    private long totalTeams;
    private long totalParticipants;
    private long totalSubmissions;
    private Map<String, Long> teamsPerTrack;
}
