package com.example.swp.features.prize;

import com.example.swp.features.prize.dto.request.AssignPrizeRequest;
import com.example.swp.features.prize.dto.request.CreatePrizeRequest;
import com.example.swp.features.prize.dto.response.PrizeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/prizes")
@RequiredArgsConstructor
public class PrizeController {

    private final PrizeService prizeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<PrizeResponse> createPrize(@RequestBody CreatePrizeRequest request) {
        PrizeResponse response = prizeService.createPrize(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/{prizeId}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<PrizeResponse> assignPrizeToTeam(@PathVariable Long prizeId, @RequestBody AssignPrizeRequest request) {
        PrizeResponse response = prizeService.assignPrizeToTeam(prizeId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/event/{hackathonEventId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEvent(@PathVariable Long hackathonEventId) {
        List<PrizeResponse> responses = prizeService.getPrizesByEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/event/{hackathonEventId}/auto-assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<List<PrizeResponse>> autoAssignPrizes(@PathVariable Long hackathonEventId) {
        List<PrizeResponse> responses = prizeService.autoAssignPrizes(hackathonEventId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{prizeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<PrizeResponse> updatePrize(@PathVariable Long prizeId, @RequestBody @jakarta.validation.Valid com.example.swp.features.prize.dto.request.UpdatePrizeRequest request) {
        PrizeResponse response = prizeService.updatePrize(prizeId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{prizeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<Void> deletePrize(@PathVariable Long prizeId) {
        prizeService.deletePrize(prizeId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/event/{hackathonEventId}/track/{trackId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEventAndTrack(@PathVariable Long hackathonEventId, @PathVariable Long trackId) {
        List<PrizeResponse> responses = prizeService.getPrizesByEventAndTrack(hackathonEventId, trackId);
        return ResponseEntity.ok(responses);
    }
}