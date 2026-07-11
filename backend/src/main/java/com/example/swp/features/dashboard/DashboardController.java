package com.example.swp.features.dashboard;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.dashboard.dto.DashboardStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(@org.springframework.web.bind.annotation.RequestParam Long hackathonEventId) {
        DashboardStatsResponse response = dashboardService.getDashboardStats(hackathonEventId);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched dashboard stats successfully"));
    }
}
