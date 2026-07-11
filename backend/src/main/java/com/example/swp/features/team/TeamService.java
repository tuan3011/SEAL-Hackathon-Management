package com.example.swp.features.team;

import com.example.swp.features.team.dto.request.CreateTeamRequest;
import com.example.swp.features.team.dto.request.DisqualifyTeamRequest;
import com.example.swp.features.team.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request);
    TeamResponse getTeamById(Long id);
    List<TeamResponse> getTeamsByEvent(Long eventId);
    List<TeamResponse> getTeamsByTrack(Long trackId);
    org.springframework.data.domain.Page<TeamResponse> getAllTeams(org.springframework.data.domain.Pageable pageable);
    TeamResponse getMyTeamForEvent(Long eventId);
    void disqualifyTeam(Long teamId, DisqualifyTeamRequest request);
    TeamResponse updateTeam(Long teamId, com.example.swp.features.team.dto.request.UpdateTeamRequest request);
    TeamResponse finalizeTeam(Long teamId);
    void deleteTeam(Long teamId);
}
