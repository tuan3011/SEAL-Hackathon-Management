package com.example.swp.features.round;

import com.example.swp.features.ranking.RankingService;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import com.example.swp.features.score.ScoreService;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RoundScheduler {

    private final RoundRepository roundRepository;
    private final ScoreService scoreService;
    private final RankingService rankingService;
    private final TeamRoundAdvancementRepository advancementRepository;
    private final TeamRepository teamRepository;
    private final com.example.swp.features.user.UserRepository userRepository;

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void checkAndAdvanceRounds() {
        LocalDateTime now = LocalDateTime.now();
        List<Round> endedRounds = roundRepository.findByGradingEndTimeBeforeAndGradingEndedFalse(now);

        for (Round round : endedRounds) {
            log.info("Auto-advancing round: {}", round.getId());
            try {
                // 1. Finalize scores
                scoreService.finalizeScores(round.getId());

                // 2. Get rankings
                List<TeamRankingResponse> rankings = rankingService.getRankingForRound(round.getId());

                // 3. Sort globally by finalScore descending (ignoring track as requested)
                rankings.sort(Comparator.comparing(TeamRankingResponse::getFinalScore).reversed()
                        .thenComparing(TeamRankingResponse::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(TeamRankingResponse::getTeamId));

                // 4. Find the next round in the event
                List<Round> nextRounds = roundRepository.findByHackathonEventIdAndRoundOrder(
                        round.getHackathonEvent().getId(), round.getRoundOrder() + 1);
                Round nextRound = nextRounds.isEmpty() ? null : nextRounds.get(0);

                int slots = round.getAdvancementSlots() != null ? round.getAdvancementSlots() : rankings.size();
                int advancedCount = 0;

                for (int i = 0; i < Math.min(slots, rankings.size()); i++) {
                    TeamRankingResponse teamRank = rankings.get(i);
                    Team team = teamRepository.findById(teamRank.getTeamId()).orElse(null);
                    
                    if (team != null && nextRound != null) {
                        TeamRoundAdvancement advancement = new TeamRoundAdvancement();
                        advancement.setTeam(team);
                        advancement.setFromRound(round);
                        advancement.setToRound(nextRound);
                        
                        // Cron job runs as system, fetch an admin user to act as the advancer
                        com.example.swp.features.user.User systemAdmin = userRepository.findAll().stream()
                                .filter(u -> u.getRole() == com.example.swp.features.user.Role.ADMIN)
                                .findFirst().orElse(null);
                        if (systemAdmin != null) {
                            advancement.setAdvancedBy(systemAdmin);
                        } else {
                            // Fallback to organizer if no admin exists
                            advancement.setAdvancedBy(round.getHackathonEvent().getOrganizer());
                        }
                        
                        advancement.setAdvancedAt(LocalDateTime.now());
                        advancementRepository.save(advancement);
                        advancedCount++;
                    }
                }

                // 5. Mark as ended
                round.setGradingEnded(true);
                roundRepository.save(round);

                log.info("Successfully auto-advanced {} teams for round {}", advancedCount, round.getId());
            } catch (Exception e) {
                log.error("Failed to auto-advance round {}: {}", round.getId(), e.getMessage());
            }
        }
    }
}
