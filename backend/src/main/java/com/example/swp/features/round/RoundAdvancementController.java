package com.example.swp.features.round;

import com.example.swp.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rounds")
@RequiredArgsConstructor
public class RoundAdvancementController {

    private final RoundAdvancementService advancementService;

    @PostMapping("/{id}/advance")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> advanceTeams(@PathVariable Long id) {
        String message = advancementService.advanceTeams(id);
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }
}
