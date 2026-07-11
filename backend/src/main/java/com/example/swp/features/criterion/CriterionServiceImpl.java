package com.example.swp.features.criterion;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.request.UpdateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;
import com.example.swp.features.score.ScoreRepository;
import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CriterionServiceImpl implements CriterionService {

    private final CriterionRepository criterionRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final ScoreRepository scoreRepository;
    private final AuditLogService auditLogService;

    @Override
    public CriterionResponse createCriterion(CreateCriterionRequest request) {
        HackathonEvent hackathonEvent = null;
        if (request.getHackathonEventId() != null) {
            hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with id: " + request.getHackathonEventId()));

            if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT 
                    && hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.PUBLISHED) {
                throw new IllegalStateException("Cannot create criterion: Configurations can only be added to events in DRAFT or PUBLISHED status.");
            }

            // Ràng buộc tổng trọng số (weight) không vượt quá 100%
            List<Criterion> existing = criterionRepository.findByHackathonEventId(hackathonEvent.getId());
            int currentSum = existing.stream().mapToInt(Criterion::getWeight).sum();
            if (currentSum + request.getWeight() > 100) {
                throw new IllegalArgumentException("Tổng hệ số (weight) của tất cả tiêu chí cho sự kiện này không được vượt quá 100%. Tổng hiện tại là: " + currentSum + "%");
            }
        }

        Criterion newCriterion = Criterion.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maxScore(request.getMaxScore())
                .weight(request.getWeight())
                .hackathonEvent(hackathonEvent) // This can be null
                .build();

        Criterion savedCriterion = criterionRepository.save(newCriterion);
        auditLogService.logAction("CREATE_CRITERION", "CRITERION", savedCriterion.getId(), null, "Created criterion " + savedCriterion.getName(), hackathonEvent != null ? hackathonEvent.getId() : null);
        return mapToResponse(savedCriterion);
    }

    @Override
    public List<CriterionResponse> getCriteriaForEvent(Long hackathonEventId) {
        return criterionRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CriterionResponse> getDefaultCriteria() {
        return criterionRepository.findByHackathonEventIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CriterionResponse updateCriterion(Long id, UpdateCriterionRequest request) {
        Criterion criterion = criterionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Criterion not found with id: " + id));

        // Kiểm tra chéo eventId
        Long dbEventId = criterion.getHackathonEvent() != null ? criterion.getHackathonEvent().getId() : null;
        if ((dbEventId == null && request.getHackathonEventId() != null) ||
            (dbEventId != null && !dbEventId.equals(request.getHackathonEventId()))) {
            throw new IllegalArgumentException("Tiêu chí này không thuộc về sự kiện được chỉ định.");
        }

        // Chặn chỉnh sửa nếu đã có điểm chấm
        if (scoreRepository.existsByCriterionId(id)) {
            throw new IllegalStateException("Không thể chỉnh sửa tiêu chí này vì đã có giám khảo thực hiện chấm điểm.");
        }

        // Ràng buộc tổng trọng số (weight) không vượt quá 100%
        if (criterion.getHackathonEvent() != null) {
            HackathonEvent event = criterion.getHackathonEvent();
            List<Criterion> existing = criterionRepository.findByHackathonEventId(event.getId());
            int currentSum = existing.stream()
                    .filter(c -> !c.getId().equals(id))
                    .mapToInt(Criterion::getWeight)
                    .sum();
            if (currentSum + request.getWeight() > 100) {
                throw new IllegalArgumentException("Tổng hệ số (weight) của tất cả tiêu chí cho sự kiện này không được vượt quá 100%. Tổng hiện tại (chưa gồm tiêu chí này) là: " + currentSum + "%");
            }
        }

        java.util.Map<String, Object> oldMap = new java.util.HashMap<>();
        oldMap.put("name", criterion.getName());
        oldMap.put("description", criterion.getDescription());
        oldMap.put("weight", criterion.getWeight());
        oldMap.put("maxScore", criterion.getMaxScore());

        java.util.Map<String, Object> newMap = new java.util.HashMap<>();
        newMap.put("name", request.getName());
        newMap.put("description", request.getDescription());
        newMap.put("weight", request.getWeight());
        newMap.put("maxScore", request.getMaxScore() != null ? request.getMaxScore() : criterion.getMaxScore());

        String oldValueJson = null;
        String newValueJson = null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            oldValueJson = mapper.writeValueAsString(oldMap);
            newValueJson = mapper.writeValueAsString(newMap);
        } catch (Exception e) {
            // ignore
        }

        criterion.setName(request.getName());
        criterion.setDescription(request.getDescription());
        criterion.setWeight(request.getWeight());
        if (request.getMaxScore() != null) {
            criterion.setMaxScore(request.getMaxScore());
        }

        Criterion updatedCriterion = criterionRepository.save(criterion);
        auditLogService.logAction("UPDATE_CRITERION", "CRITERION", updatedCriterion.getId(), oldValueJson, newValueJson, criterion.getHackathonEvent() != null ? criterion.getHackathonEvent().getId() : null);
        return mapToResponse(updatedCriterion);
    }

    @Override
    public void deleteCriterion(Long id, Long eventId) {
        Criterion criterion = criterionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Criterion not found with id: " + id));

        // Kiểm tra chéo eventId
        Long dbEventId = criterion.getHackathonEvent() != null ? criterion.getHackathonEvent().getId() : null;
        if ((dbEventId == null && eventId != null) ||
            (dbEventId != null && !dbEventId.equals(eventId))) {
            throw new IllegalArgumentException("Tiêu chí này không thuộc về sự kiện được chỉ định.");
        }

        // Chặn xóa nếu đã có điểm chấm
        if (scoreRepository.existsByCriterionId(id)) {
            throw new IllegalStateException("Không thể xóa tiêu chí này vì đã có giám khảo thực hiện chấm điểm.");
        }

        criterionRepository.deleteById(id);
        auditLogService.logAction("DELETE_CRITERION", "CRITERION", id, "Criterion name: " + criterion.getName(), null, eventId);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<CriterionResponse> copyCriteria(Long fromEventId, Long toEventId) {
        HackathonEvent targetEvent = hackathonEventRepository.findById(toEventId)
                .orElseThrow(() -> new RuntimeException("Target hackathon event not found: " + toEventId));

        List<Criterion> sourceCriteria = criterionRepository.findByHackathonEventId(fromEventId);
        if (sourceCriteria.isEmpty()) {
            throw new IllegalStateException("No criteria found in the source event to copy.");
        }

        List<Criterion> clonedCriteria = sourceCriteria.stream()
                .map(c -> Criterion.builder()
                        .name(c.getName())
                        .description(c.getDescription())
                        .maxScore(c.getMaxScore())
                        .weight(c.getWeight())
                        .hackathonEvent(targetEvent)
                        .build())
                .collect(Collectors.toList());

        List<Criterion> savedCriteria = criterionRepository.saveAll(clonedCriteria);
        return savedCriteria.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private CriterionResponse mapToResponse(Criterion criterion) {
        return CriterionResponse.builder()
                .id(criterion.getId())
                .name(criterion.getName())
                .description(criterion.getDescription())
                .maxScore(criterion.getMaxScore())
                .weight(criterion.getWeight())
                .hackathonEventId(criterion.getHackathonEvent() != null ? criterion.getHackathonEvent().getId() : null)
                .isDefault(criterion.getHackathonEvent() == null)
                .build();
    }
}
