package com.example.swp.features.round;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;
import com.example.swp.features.audit_log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final AuditLogService auditLogService;

    @Override
    public RoundResponse createRound(CreateRoundRequest request) {
        HackathonEvent hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Hackathon event not found"));

        if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT 
                && hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED) {
            throw new IllegalStateException("Cannot create round: Configurations can only be added to events in DRAFT or PUBLISHED status.");
        }

        validateRoundTimeline(request.getStartTime(), request.getEndTime(), request.getGradingEndTime(), hackathonEvent, null, request.getAdvancementSlots());

        List<Round> existing = roundRepository.findByHackathonEventId(hackathonEvent.getId());
        boolean nameExists = existing.stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase(request.getName().trim()));
        if (nameExists) {
            throw new com.example.swp.exception.BadRequestException("Vòng thi với tên này đã tồn tại trong cuộc thi.");
        }
        int nextOrder = existing.size() + 1;

        Round newRound = Round.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .gradingEndTime(request.getGradingEndTime())
                .gradingEnded(false)
                .hackathonEvent(hackathonEvent)
                .roundOrder(nextOrder)
                .advancementSlots(request.getAdvancementSlots() != null && request.getAdvancementSlots() > 0 ? request.getAdvancementSlots() : 2)
                .build();

        Round savedRound = roundRepository.save(newRound);
        auditLogService.logAction("CREATE_ROUND", "ROUND", savedRound.getId(), null, "Created round " + savedRound.getName(), hackathonEvent.getId());
        return mapToResponse(savedRound);
    }

    @Override
    public List<RoundResponse> getRoundsByHackathonEvent(Long hackathonEventId) {
        return roundRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoundResponse getRoundById(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));
        return mapToResponse(round);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteRound(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        HackathonEvent event = round.getHackathonEvent();

        // Check if event status is DRAFT
        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Cannot delete round: Only events in DRAFT status can have their rounds deleted.");
        }

        roundRepository.delete(round);
        auditLogService.logAction("DELETE_ROUND", "ROUND", id, "Round name: " + round.getName(), null, event.getId());

        // Re-order remaining rounds
        List<Round> remaining = roundRepository.findByHackathonEventId(event.getId()).stream()
                .filter(r -> !r.getId().equals(id))
                .sorted(java.util.Comparator.comparing(Round::getStartTime))
                .collect(Collectors.toList());
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setRoundOrder(i + 1);
            roundRepository.save(remaining.get(i));
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RoundResponse updateRound(Long id, com.example.swp.features.round.dto.request.CreateRoundRequest request) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        HackathonEvent hackathonEvent = round.getHackathonEvent();

        // Check if event status is DRAFT, PUBLISHED, or IN_PROGRESS
        if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT
                && hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED
                && hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot edit round: Only events in DRAFT, PUBLISHED, or IN_PROGRESS status can have their rounds modified.");
        }

        validateRoundTimeline(request.getStartTime(), request.getEndTime(), request.getGradingEndTime(), hackathonEvent, id, request.getAdvancementSlots());

        boolean nameExists = roundRepository.findByHackathonEventId(hackathonEvent.getId()).stream()
                .anyMatch(r -> !r.getId().equals(id) && r.getName().equalsIgnoreCase(request.getName().trim()));
        if (nameExists) {
            throw new com.example.swp.exception.BadRequestException("Vòng thi với tên này đã tồn tại trong cuộc thi.");
        }

        java.util.Map<String, Object> oldMap = new java.util.HashMap<>();
        oldMap.put("name", round.getName());
        oldMap.put("description", round.getDescription());
        oldMap.put("startTime", round.getStartTime() != null ? round.getStartTime().toString() : null);
        oldMap.put("endTime", round.getEndTime() != null ? round.getEndTime().toString() : null);
        oldMap.put("gradingEndTime", round.getGradingEndTime() != null ? round.getGradingEndTime().toString() : null);
        oldMap.put("advancementSlots", round.getAdvancementSlots());

        java.util.Map<String, Object> newMap = new java.util.HashMap<>();
        newMap.put("name", request.getName());
        newMap.put("description", request.getDescription());
        newMap.put("startTime", request.getStartTime() != null ? request.getStartTime().toString() : null);
        newMap.put("endTime", request.getEndTime() != null ? request.getEndTime().toString() : null);
        newMap.put("gradingEndTime", request.getGradingEndTime() != null ? request.getGradingEndTime().toString() : null);
        newMap.put("advancementSlots", request.getAdvancementSlots() != null && request.getAdvancementSlots() > 0 ? request.getAdvancementSlots() : round.getAdvancementSlots());

        String oldValueJson = null;
        String newValueJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            oldValueJson = mapper.writeValueAsString(oldMap);
            newValueJson = mapper.writeValueAsString(newMap);
        } catch (Exception e) {
            // ignore
        }

        round.setName(request.getName());
        round.setDescription(request.getDescription());
        round.setStartTime(request.getStartTime());
        round.setEndTime(request.getEndTime());
        round.setGradingEndTime(request.getGradingEndTime());
        if (request.getAdvancementSlots() != null && request.getAdvancementSlots() > 0) {
            round.setAdvancementSlots(request.getAdvancementSlots());
        }

        Round updatedRound = roundRepository.save(round);
        auditLogService.logAction("UPDATE_ROUND", "ROUND", updatedRound.getId(), oldValueJson, newValueJson, hackathonEvent.getId());
        return mapToResponse(updatedRound);
    }

    private void validateRoundTimeline(java.time.LocalDateTime start, java.time.LocalDateTime end, java.time.LocalDateTime gradingEnd, HackathonEvent event, Long currentRoundId, Integer newAdvancementSlots) {
        if (start.isAfter(end) || start.isEqual(end)) {
            throw new IllegalArgumentException("Round start time must be before end time.");
        }
        if (gradingEnd == null) {
            throw new IllegalArgumentException("Grading end time cannot be null.");
        }
        if (gradingEnd.isBefore(end) || gradingEnd.isEqual(end)) {
            throw new IllegalArgumentException("Grading end time must be after round end time.");
        }
        if (start.isBefore(event.getStartTime())) {
            throw new IllegalArgumentException("Round start time cannot be before event start time (" + event.getStartTime() + ").");
        }
        if (gradingEnd.isAfter(event.getEndTime())) {
            throw new IllegalArgumentException("Round grading end time cannot be after event end time (" + event.getEndTime() + ").");
        }
        if (event.getRegistrationEnd() != null && start.isBefore(event.getRegistrationEnd())) {
            throw new IllegalArgumentException("Round start time must be after event registration end time (" + event.getRegistrationEnd() + ").");
        }

        List<Round> allRounds = new java.util.ArrayList<>(roundRepository.findByHackathonEventId(event.getId()));
        if (currentRoundId == null) {
            Round temp = Round.builder()
                    .name("New Round")
                    .startTime(start)
                    .endTime(end)
                    .gradingEndTime(gradingEnd)
                    .advancementSlots(newAdvancementSlots != null && newAdvancementSlots > 0 ? newAdvancementSlots : 2)
                    .build();
            allRounds.add(temp);
        } else {
            for (int i = 0; i < allRounds.size(); i++) {
                if (allRounds.get(i).getId().equals(currentRoundId)) {
                    allRounds.get(i).setStartTime(start);
                    allRounds.get(i).setEndTime(end);
                    allRounds.get(i).setGradingEndTime(gradingEnd);
                    if (newAdvancementSlots != null && newAdvancementSlots > 0) {
                        allRounds.get(i).setAdvancementSlots(newAdvancementSlots);
                    }
                }
            }
        }

        // Sort chronologically
        allRounds.sort(java.util.Comparator.comparing(Round::getStartTime));

        // Check overlaps and sequential slots
        for (int i = 0; i < allRounds.size(); i++) {
            Round current = allRounds.get(i);
            java.time.LocalDateTime currentEndTime = current.getEndTime();
            java.time.LocalDateTime currentGradingEndTime = current.getGradingEndTime();
            if (Boolean.TRUE.equals(current.getGradingEnded()) && currentGradingEndTime != null) {
                if (currentEndTime == null || currentEndTime.isAfter(currentGradingEndTime)) {
                    currentEndTime = currentGradingEndTime;
                }
            }

            if (i < allRounds.size() - 1) {
                Round next = allRounds.get(i + 1);
                if (currentGradingEndTime != null && next.getStartTime().isBefore(currentGradingEndTime)) {
                    throw new IllegalArgumentException("Thời gian bắt đầu của vòng tiếp theo '" + next.getName() + "' (" + next.getStartTime() + 
                            ") phải sau thời gian kết thúc chấm điểm của vòng trước '" + current.getName() + "' (" + currentGradingEndTime + ").");
                }
                if (currentEndTime != null && currentEndTime.isAfter(next.getStartTime())) {
                    throw new IllegalArgumentException("Round times overlap: '" + current.getName() + "' ends at " + currentEndTime + 
                            ", but next round starts at " + next.getStartTime() + ".");
                }
                if (current.getAdvancementSlots() != null && next.getAdvancementSlots() != null) {
                    if (next.getAdvancementSlots() >= current.getAdvancementSlots()) {
                        throw new IllegalArgumentException("Advancement slots of subsequent round must be less than the previous round. Round '" + 
                                current.getName() + "' has " + current.getAdvancementSlots() + " slots, but next round has " + next.getAdvancementSlots() + " slots.");
                    }
                }
            }
        }
    }

    private RoundResponse mapToResponse(Round round) {
        return RoundResponse.builder()
                .id(round.getId())
                .name(round.getName())
                .description(round.getDescription())
                .startTime(round.getStartTime())
                .endTime(round.getEndTime())
                .gradingEndTime(round.getGradingEndTime())
                .gradingEnded(round.getGradingEnded())
                .hackathonEventId(round.getHackathonEvent().getId())
                .advancementSlots(round.getAdvancementSlots())
                .submissionDeadline(round.getSubmissionDeadline())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RoundResponse endGrading(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        round.setGradingEnded(true);
        round.setGradingEndTime(now);
        if (round.getEndTime() == null || round.getEndTime().isAfter(now)) {
            round.setEndTime(now);
        }
        Round saved = roundRepository.save(round);

        auditLogService.logAction("END_GRADING", "ROUND", saved.getId(), null, "Ended grading early for round " + saved.getName(), saved.getHackathonEvent().getId());

        return mapToResponse(saved);
    }
}
