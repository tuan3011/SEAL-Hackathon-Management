package com.example.swp.features.ranking;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/round/{roundId}")
    @PreAuthorize("permitAll()") // Publicly accessible leaderboard
    public ResponseEntity<ApiResponse<List<TeamRankingResponse>>> getRankingForRound(@PathVariable Long roundId) {
        List<TeamRankingResponse> rankings = rankingService.getRankingForRound(roundId);
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }
}
