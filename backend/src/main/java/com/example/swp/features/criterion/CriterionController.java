package com.example.swp.features.criterion;

import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.request.UpdateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/criteria")
@RequiredArgsConstructor
public class CriterionController {

    private final CriterionService criterionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<CriterionResponse>> createCriterion(@RequestBody CreateCriterionRequest request) {
        CriterionResponse response = criterionService.createCriterion(request);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Criterion created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/event/{hackathonEventId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<CriterionResponse>>> getCriteriaForEvent(@PathVariable Long hackathonEventId) {
        List<CriterionResponse> responses = criterionService.getCriteriaForEvent(hackathonEventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @GetMapping("/default")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<CriterionResponse>>> getDefaultCriteria() {
        List<CriterionResponse> responses = criterionService.getDefaultCriteria();
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<CriterionResponse>> updateCriterion(@PathVariable Long id, @Valid @RequestBody UpdateCriterionRequest request) {
        CriterionResponse response = criterionService.updateCriterion(id, request);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(response, "Criterion updated successfully."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> deleteCriterion(
            @PathVariable Long id,
            @RequestParam(required = false) Long eventId) {
        criterionService.deleteCriterion(id, eventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Criterion deleted successfully."));
    }

    @PostMapping("/copy")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<CriterionResponse>>> copyCriteria(
            @RequestParam Long fromEventId,
            @RequestParam Long toEventId) {
        List<CriterionResponse> responses = criterionService.copyCriteria(fromEventId, toEventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses, "Criteria copied successfully."));
    }
}