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
                List<TeamRankingResponse> rankings = new java.util.ArrayList<>(rankingService.getRankingForRound(round.getId()));

                // 3. RankingService already sorts by track then rank

                // 4. Find the next round in the event
                List<Round> nextRounds = roundRepository.findByHackathonEventIdAndRoundOrder(
                        round.getHackathonEvent().getId(), round.getRoundOrder() + 1);
                
                if (nextRounds.isEmpty()) {
                    com.example.swp.features.hackathon_event.HackathonEvent event = round.getHackathonEvent();
                    event.setStatus(com.example.swp.features.hackathon_event.HackathonStatus.COMPLETED);
                    
                    if (rankings != null && !rankings.isEmpty()) {
                        List<Long> teamIds = rankings.stream().map(TeamRankingResponse::getTeamId).collect(java.util.stream.Collectors.toList());
                        List<Team> teams = teamRepository.findAllById(teamIds);
                        java.util.Map<Long, Team> teamMap = teams.stream().collect(java.util.stream.Collectors.toMap(Team::getId, t -> t));
                        for (TeamRankingResponse rankResponse : rankings) {
                            Team team = teamMap.get(rankResponse.getTeamId());
                            if (team != null) {
                                team.setFinalScore(rankResponse.getFinalScore());
                            }
                        }
                        teamRepository.saveAll(teams);
                    }
                    round.setGradingEnded(true);
                    roundRepository.save(round);
                    log.info("Auto-completed event and assigned final scores for round {}", round.getId());
                    continue;
                }

                Round nextRound = nextRounds.get(0);
                int slots = round.getAdvancementSlots() != null ? round.getAdvancementSlots() : Integer.MAX_VALUE;
                int advancedCount = 0;
                java.util.Map<Long, Integer> slotsFilledPerTrack = new java.util.HashMap<>();

                // Cron job runs as system, fetch an admin user to act as the advancer
                com.example.swp.features.user.User systemAdmin = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == com.example.swp.features.user.Role.ADMIN)
                        .findFirst().orElse(null);
                com.example.swp.features.user.User advancer = systemAdmin != null ? systemAdmin : round.getHackathonEvent().getOrganizer();

                for (TeamRankingResponse teamRank : rankings) {
                    Team team = teamRepository.findById(teamRank.getTeamId()).orElse(null);
                    
                    if (team != null && team.getStatus() != com.example.swp.features.team.TeamStatus.DISQUALIFIED) {
                        Long trackId = team.getTrack() != null ? team.getTrack().getId() : -1L;
                        int currentSlots = slotsFilledPerTrack.getOrDefault(trackId, 0);

                        if (currentSlots < slots) {
                            TeamRoundAdvancement advancement = new TeamRoundAdvancement();
                            advancement.setTeam(team);
                            advancement.setFromRound(round);
                            advancement.setToRound(nextRound);
                            advancement.setAdvancedBy(advancer);
                            advancement.setAdvancedAt(LocalDateTime.now());
                            advancementRepository.save(advancement);
                            slotsFilledPerTrack.put(trackId, currentSlots + 1);
                            advancedCount++;
                        } else {
                            team.setStatus(com.example.swp.features.team.TeamStatus.DISQUALIFIED);
                            team.setDisqualificationReason("Eliminated after " + round.getName());
                            team.setDisqualifiedAt(LocalDateTime.now());
                            team.setDisqualifiedBy(advancer);
                            teamRepository.save(team);
                        }
                    }
                }

                // 5. Mark as ended
                round.setGradingEnded(true);
                roundRepository.save(round);

                log.info("Successfully auto-advanced {} teams for round {}", advancedCount, round.getId());
            } catch (Exception e) {
                log.error("Failed to auto-advance round " + round.getId(), e);
            }
        }
    }
}
