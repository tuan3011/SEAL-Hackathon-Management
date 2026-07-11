package com.example.swp.features.round;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.ranking.RankingService;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.team.TeamStatus;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.hackathon_event.HackathonStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RoundAdvancementService {

    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;
    private final TeamRoundAdvancementRepository advancementRepository;
    private final RankingService rankingService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final HackathonEventRepository hackathonEventRepository;

    @Transactional
    public String advanceTeams(Long fromRoundId) {
        Round fromRound = roundRepository.findById(fromRoundId)
                .orElseThrow(() -> new ResourceNotFoundException("Round not found: " + fromRoundId));

        boolean hasEnded = Boolean.TRUE.equals(fromRound.getGradingEnded()) 
                || !LocalDateTime.now().isBefore(fromRound.getEndTime());
        if (!hasEnded) {
            throw new IllegalStateException("Cannot advance teams before the round has ended.");
        }

        if (advancementRepository.existsByFromRoundId(fromRoundId)) {
            throw new IllegalStateException("Teams have already been advanced for this round.");
        }

        List<Round> nextRounds = roundRepository.findByHackathonEventIdAndRoundOrder(
                fromRound.getHackathonEvent().getId(), fromRound.getRoundOrder() + 1);
        
        if (nextRounds.isEmpty()) {
            HackathonEvent event = fromRound.getHackathonEvent();
            event.setStatus(HackathonStatus.COMPLETED);
            hackathonEventRepository.save(event);

            // Calculate final round average scores and update team finalScore
            List<TeamRankingResponse> rankings = rankingService.getRankingForRound(fromRoundId);
            if (rankings != null && !rankings.isEmpty()) {
                List<Long> teamIds = rankings.stream().map(TeamRankingResponse::getTeamId).collect(Collectors.toList());
                List<Team> teams = teamRepository.findAllById(teamIds);
                Map<Long, Team> teamMap = teams.stream().collect(Collectors.toMap(Team::getId, t -> t));
                for (TeamRankingResponse rankResponse : rankings) {
                    Team team = teamMap.get(rankResponse.getTeamId());
                    if (team != null) {
                        team.setFinalScore(rankResponse.getFinalScore());
                    }
                }
                teamRepository.saveAll(teams);
            }

            auditLogService.logAction(
                    "COMPLETE_EVENT",
                    "EVENT",
                    event.getId(),
                    "0",
                    "Event completed. Final round: " + fromRound.getName() + " has ended. Final scores populated."
            );
            return "Final round completed. Hackathon event marked as COMPLETED. Final scores updated.";
        }

        if (fromRound.getAdvancementSlots() == null || fromRound.getAdvancementSlots() <= 0) {
            throw new IllegalStateException("Round does not have valid advancement slots defined.");
        }

        if (nextRounds.size() > 1) {
            throw new IllegalStateException("Ambiguous next round configuration. Multiple rounds found with the same order.");
        }
        Round toRound = nextRounds.get(0);

        List<TeamRankingResponse> rankings = rankingService.getRankingForRound(fromRoundId);
        if (rankings == null || rankings.isEmpty()) {
            throw new IllegalStateException("Rankings are empty. Cannot advance teams.");
        }

        List<Long> teamIds = rankings.stream().map(TeamRankingResponse::getTeamId).collect(Collectors.toList());
        Map<Long, Team> teamMap = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, t -> t));

        User currentUser = getCurrentUser();
        List<TeamRoundAdvancement> advancements = new ArrayList<>();
        java.util.Map<Long, Integer> slotsFilledPerTrack = new java.util.HashMap<>();

        for (TeamRankingResponse rankResponse : rankings) {
            Team team = teamMap.get(rankResponse.getTeamId());
            if (team != null && team.getStatus() != TeamStatus.DISQUALIFIED) {
                Long trackId = team.getTrack() != null ? team.getTrack().getId() : -1L;
                int currentSlots = slotsFilledPerTrack.getOrDefault(trackId, 0);

                if (currentSlots < fromRound.getAdvancementSlots()) {
                    TeamRoundAdvancement adv = TeamRoundAdvancement.builder()
                            .team(team)
                            .fromRound(fromRound)
                            .toRound(toRound)
                            .advancedBy(currentUser)
                            .build();
                    advancements.add(adv);
                    slotsFilledPerTrack.put(trackId, currentSlots + 1);
                }
            }
        }

        if (advancements.isEmpty()) {
            throw new IllegalStateException("No eligible ACTIVE teams found to advance.");
        }

        try {
            advancementRepository.saveAll(advancements);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Teams have already been advanced for this round.");
        }

        String teamIdsStr = advancements.stream()
                .map(a -> String.valueOf(a.getTeam().getId()))
                .collect(Collectors.joining(","));

        auditLogService.logAction(
                "ADVANCE_ROUND",
                "ROUND",
                fromRoundId,
                "0",
                "Advanced Teams: [" + teamIdsStr + "] to Round " + toRound.getId()
        );
        return "Teams advanced successfully to the next round.";
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}
