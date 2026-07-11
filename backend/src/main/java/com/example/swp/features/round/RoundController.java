package com.example.swp.features.round;

import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rounds")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<RoundResponse>> createRound(@Valid @RequestBody CreateRoundRequest request) {
        RoundResponse response = roundService.createRound(request);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Round created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/hackathon/{hackathonEventId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<RoundResponse>>> getRoundsByHackathonEvent(@PathVariable Long hackathonEventId) {
        List<RoundResponse> responses = roundService.getRoundsByHackathonEvent(hackathonEventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.example.swp.common.ApiResponse<RoundResponse>> getRoundById(@PathVariable Long id) {
        RoundResponse response = roundService.getRoundById(id);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> deleteRound(@PathVariable Long id) {
        roundService.deleteRound(id);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Round deleted successfully."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<RoundResponse>> updateRound(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody com.example.swp.features.round.dto.request.CreateRoundRequest request) {
        RoundResponse response = roundService.updateRound(id, request);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(response, "Round updated successfully."));
    }

    @PostMapping("/{id}/end-grading")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<com.example.swp.common.ApiResponse<RoundResponse>> endGrading(@PathVariable Long id) {
        RoundResponse response = roundService.endGrading(id);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(response, "Grading period ended early successfully."));
    }
}