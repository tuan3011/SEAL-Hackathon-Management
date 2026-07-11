package com.example.swp.features.criterion;

import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;

import java.util.List;

public interface CriterionService {
    CriterionResponse createCriterion(CreateCriterionRequest request);
    List<CriterionResponse> getCriteriaForEvent(Long hackathonEventId);
    List<CriterionResponse> getDefaultCriteria();
    CriterionResponse updateCriterion(Long id, com.example.swp.features.criterion.dto.request.UpdateCriterionRequest request);
    void deleteCriterion(Long id, Long eventId);
    List<CriterionResponse> copyCriteria(Long fromEventId, Long toEventId);
}
