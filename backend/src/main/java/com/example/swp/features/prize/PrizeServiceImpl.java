package com.example.swp.features.prize;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.team.Team;
import com.example.swp.features.team.TeamRepository;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.prize.dto.request.AssignPrizeRequest;
import com.example.swp.features.prize.dto.request.CreatePrizeRequest;
import com.example.swp.features.prize.dto.response.PrizeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@SuppressWarnings("null")
public class PrizeServiceImpl implements PrizeService {

    private final PrizeRepository prizeRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final TrackRepository trackRepository;
    private final TeamRepository teamRepository;
    private final com.example.swp.features.round.RoundRepository roundRepository;
    private final com.example.swp.features.ranking.RankingService rankingService;
    private final com.example.swp.features.audit_log.AuditLogService auditLogService;

    @Override
    public PrizeResponse createPrize(CreatePrizeRequest request) {
        HackathonEvent event = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT 
                && event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot create prize: Configurations can only be added to events in DRAFT or PUBLISHED status.");
        }

        Track track = null;
        if (request.getTrackId() != null) {
            track = trackRepository.findById(request.getTrackId())
                    .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        }

        validateUniqueRank(request.getHackathonEventId(), request.getTrackId(), request.getRank(), null);

        Prize newPrize = Prize.builder()
                .name(request.getName())
                .description(request.getDescription())
                .hackathonEvent(event)
                .track(track)
                .rank(request.getRank())
                .cash(request.getCash())
                .hasCup(request.getCup() != null && !request.getCup().trim().isEmpty())
                .hasCertificate(request.getCertificate() != null && !request.getCertificate().trim().isEmpty())
                .cup(request.getCup())
                .certificate(request.getCertificate())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .build();

        Prize savedPrize = prizeRepository.save(newPrize);
        auditLogService.logAction("CREATE_PRIZE", "PRIZE", savedPrize.getId(), null, "Created prize " + savedPrize.getName(), savedPrize.getHackathonEvent().getId());
        return mapToResponse(savedPrize);
    }

    @Override
    public PrizeResponse assignPrizeToTeam(Long prizeId, AssignPrizeRequest request) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> new ResourceNotFoundException("Prize not found"));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (prize.getTrack() == null || prize.getRank() == null) {
            throw new IllegalArgumentException("Cannot assign prize with track NULL or rank NULL");
        }

        Long teamTrackId = team.getTrack() != null ? team.getTrack().getId() : null;
        Long prizeTrackId = prize.getTrack().getId();
        
        if (teamTrackId == null || !teamTrackId.equals(prizeTrackId)) {
            throw new IllegalArgumentException("Team track does not match prize track");
        }

        boolean teamHasPrize = prizeRepository.findByHackathonEventId(prize.getHackathonEvent().getId()).stream()
                .anyMatch(p -> !p.getId().equals(prizeId) && p.getWinningTeam() != null && p.getWinningTeam().getId().equals(team.getId()));
        if (teamHasPrize) {
            throw new IllegalArgumentException("Team has already received a prize in this event");
        }

        List<Prize> duplicates = prizeRepository.findByHackathonEventId(prize.getHackathonEvent().getId()).stream()
                .filter(p -> !p.getId().equals(prize.getId()))
                .filter(p -> p.getRank() != null && p.getRank().equals(prize.getRank()))
                .filter(p -> {
                    Long tId = p.getTrack() != null ? p.getTrack().getId() : null;
                    Long pTId = prize.getTrack() != null ? prize.getTrack().getId() : null;
                    return java.util.Objects.equals(tId, pTId);
                })
                .collect(Collectors.toList());
        if (!duplicates.isEmpty()) {
            prizeRepository.deleteAll(duplicates);
            auditLogService.logAction("DELETE_DUPLICATE_PRIZES", "PRIZE", prize.getId(), null, "Deleted " + duplicates.size() + " duplicate prizes upon manual assignment", prize.getHackathonEvent().getId());
        }

        prize.setWinningTeam(team);
        Prize updatedPrize = prizeRepository.save(prize);
        auditLogService.logAction("ASSIGN_PRIZE", "PRIZE", prizeId, null, "Assigned prize " + prize.getName() + " to team " + team.getName(), prize.getHackathonEvent().getId());
        return mapToResponse(updatedPrize);
    }

    @Override
    public List<PrizeResponse> getPrizesByEvent(Long hackathonEventId) {
        return prizeRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrizeResponse> autoAssignPrizes(Long hackathonEventId) {
        List<com.example.swp.features.round.Round> rounds = roundRepository.findByHackathonEventId(hackathonEventId).stream()
                .sorted(java.util.Comparator.comparing(com.example.swp.features.round.Round::getRoundOrder).reversed())
                .collect(Collectors.toList());

        if (rounds.isEmpty()) {
            throw new ResourceNotFoundException("No rounds found for event");
        }

        List<com.example.swp.features.ranking.dto.TeamRankingResponse> rankings = List.of();
        for (com.example.swp.features.round.Round r : rounds) {
            rankings = rankingService.getRankingForRound(r.getId());
            if (!rankings.isEmpty()) {
                break;
            }
        }
        List<Prize> allPrizes = prizeRepository.findByHackathonEventId(hackathonEventId);

        java.util.Map<String, List<Prize>> groupedPrizes = allPrizes.stream()
                .filter(p -> p.getRank() != null)
                .collect(Collectors.groupingBy(p -> (p.getTrack() != null ? p.getTrack().getId() : "null") + "-" + p.getRank()));

        List<Prize> validPrizes = new java.util.ArrayList<>();
        for (List<Prize> group : groupedPrizes.values()) {
            group.sort(java.util.Comparator.comparing(Prize::getId));
            validPrizes.add(group.get(0));
            if (group.size() > 1) {
                List<Prize> toDelete = group.subList(1, group.size());
                prizeRepository.deleteAll(toDelete);
                auditLogService.logAction("DELETE_DUPLICATE_PRIZES", "PRIZE", group.get(0).getId(), null, "Deleted " + toDelete.size() + " duplicate prizes during auto-assign", hackathonEventId);
            }
        }

        // Clear existing winners for valid prizes to prepare for fresh auto-assignment
        for (Prize prize : validPrizes) {
            prize.setWinningTeam(null);
            prizeRepository.save(prize);
        }

        java.util.Set<Long> awardedTeamIds = new java.util.HashSet<>();

        // Group valid prizes by track
        java.util.Map<Long, List<Prize>> prizesByTrack = validPrizes.stream()
                .collect(Collectors.groupingBy(p -> p.getTrack() != null ? p.getTrack().getId() : -1L));

        for (java.util.Map.Entry<Long, List<Prize>> entry : prizesByTrack.entrySet()) {
            Long trackId = entry.getKey();
            List<Prize> trackPrizes = entry.getValue();
            // Sort prizes by rank ascending (1, 2, 3...)
            trackPrizes.sort(java.util.Comparator.comparing(Prize::getRank));

            List<com.example.swp.features.ranking.dto.TeamRankingResponse> trackRankings = rankings.stream()
                    .filter(r -> {
                        Team t = teamRepository.findById(r.getTeamId()).orElse(null);
                        if (t == null) return false;
                        Long tId = t.getTrack() != null ? t.getTrack().getId() : -1L;
                        return tId.equals(trackId);
                    })
                    .collect(Collectors.toList());

            int teamIndex = 0;
            for (Prize prize : trackPrizes) {
                if (prize.getRank() == null || prize.getRank() <= 0) continue;

                while (teamIndex < trackRankings.size()) {
                    Long winningTeamId = trackRankings.get(teamIndex).getTeamId();
                    teamIndex++;
                    if (!awardedTeamIds.contains(winningTeamId)) {
                        Team winningTeam = teamRepository.findById(winningTeamId).orElse(null);
                        prize.setWinningTeam(winningTeam);
                        prizeRepository.save(prize);
                        awardedTeamIds.add(winningTeamId);
                        break;
                    }
                }
            }
        }
        return getPrizesByEvent(hackathonEventId);
    }

    @Override
    public PrizeResponse updatePrize(Long prizeId, com.example.swp.features.prize.dto.request.UpdatePrizeRequest request) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> new ResourceNotFoundException("Prize not found"));
        
        HackathonEvent event = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));

        Track track = null;
        if (request.getTrackId() != null) {
            track = trackRepository.findById(request.getTrackId())
                    .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
        }

        validateUniqueRank(request.getHackathonEventId(), request.getTrackId(), request.getRank(), prizeId);

        java.util.Map<String, Object> oldMap = new java.util.HashMap<>();
        oldMap.put("name", prize.getName());
        oldMap.put("description", prize.getDescription());
        oldMap.put("rank", prize.getRank());
        oldMap.put("cash", prize.getCash());
        oldMap.put("currency", prize.getCurrency());
        oldMap.put("cup", prize.getCup());
        oldMap.put("certificate", prize.getCertificate());

        java.util.Map<String, Object> newMap = new java.util.HashMap<>();
        newMap.put("name", request.getName());
        newMap.put("description", request.getDescription());
        newMap.put("rank", request.getRank());
        newMap.put("cash", request.getCash());
        newMap.put("currency", request.getCurrency() != null ? request.getCurrency() : "VND");
        newMap.put("cup", request.getCup());
        newMap.put("certificate", request.getCertificate());

        String oldValueJson = null;
        String newValueJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            oldValueJson = mapper.writeValueAsString(oldMap);
            newValueJson = mapper.writeValueAsString(newMap);
        } catch (Exception e) {
            // ignore
        }

        prize.setName(request.getName());
        prize.setDescription(request.getDescription());
        prize.setRank(request.getRank());
        prize.setHackathonEvent(event);
        prize.setTrack(track);
        prize.setCash(request.getCash());
        prize.setHasCup(request.getCup() != null && !request.getCup().trim().isEmpty());
        prize.setHasCertificate(request.getCertificate() != null && !request.getCertificate().trim().isEmpty());
        prize.setCup(request.getCup());
        prize.setCertificate(request.getCertificate());
        prize.setCurrency(request.getCurrency() != null ? request.getCurrency() : "VND");
        
        Prize updatedPrize = prizeRepository.save(prize);
        auditLogService.logAction("UPDATE_PRIZE", "PRIZE", prizeId, oldValueJson, newValueJson, updatedPrize.getHackathonEvent().getId());
        return mapToResponse(updatedPrize);
    }

    @Override
    public void deletePrize(Long prizeId) {
        Prize prize = prizeRepository.findById(prizeId)
                .orElseThrow(() -> new ResourceNotFoundException("Prize not found"));
        prizeRepository.delete(prize);
        auditLogService.logAction("DELETE_PRIZE", "PRIZE", prizeId, null, "Deleted prize " + prize.getName(), prize.getHackathonEvent().getId());
    }

    @Override
    public List<PrizeResponse> getPrizesByEventAndTrack(Long hackathonEventId, Long trackId) {
        return prizeRepository.findByHackathonEventIdAndTrackId(hackathonEventId, trackId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateUniqueRank(Long eventId, Long trackId, Integer rank, Long currentPrizeId) {
        if (rank == null) return;
        List<Prize> prizes = prizeRepository.findByHackathonEventId(eventId);
        for (Prize p : prizes) {
            if (currentPrizeId != null && p.getId().equals(currentPrizeId)) continue;
            if (p.getRank() != null && p.getRank().equals(rank)) {
                Long pTrackId = p.getTrack() != null ? p.getTrack().getId() : null;
                if (java.util.Objects.equals(trackId, pTrackId)) {
                    throw new IllegalArgumentException("A prize with rank " + rank + " already exists in this track.");
                }
            }
        }
    }

    private PrizeResponse mapToResponse(Prize prize) {
        return PrizeResponse.builder()
                .id(prize.getId())
                .name(prize.getName())
                .description(prize.getDescription())
                .hackathonEventId(prize.getHackathonEvent().getId())
                .trackId(prize.getTrack() != null ? prize.getTrack().getId() : null)
                .trackName(prize.getTrack() != null ? prize.getTrack().getName() : null)
                .winningTeamId(prize.getWinningTeam() != null ? prize.getWinningTeam().getId() : null)
                .winningTeamName(prize.getWinningTeam() != null ? prize.getWinningTeam().getName() : null)
                .rank(prize.getRank())
                .cash(prize.getCash())
                .hasCup(prize.getHasCup())
                .hasCertificate(prize.getHasCertificate())
                .cup(prize.getCup())
                .certificate(prize.getCertificate())
                .currency(prize.getCurrency())
                .build();
    }
}
