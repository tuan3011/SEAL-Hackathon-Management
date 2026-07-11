package com.example.swp.features.dashboard;

import com.example.swp.features.dashboard.dto.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats(Long hackathonEventId);
}
