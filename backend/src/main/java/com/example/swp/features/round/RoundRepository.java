package com.example.swp.features.round;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    List<Round> findByHackathonEventId(Long hackathonEventId);
    List<Round> findByHackathonEventIdOrderByRoundOrderDesc(Long hackathonEventId);
    Optional<Round> findByHackathonEventIdAndName(Long hackathonEventId, String name);
    List<Round> findByHackathonEventIdAndRoundOrder(Long hackathonEventId, Integer roundOrder);

    /**
     * Tìm round cuối cùng (roundOrder cao nhất) của một event.
     * Dùng khi event COMPLETED để lấy ranking vòng chung kết.
     */
    Optional<Round> findTopByHackathonEventIdOrderByRoundOrderDesc(Long hackathonEventId);

    List<Round> findByGradingEndTimeBeforeAndGradingEndedFalse(java.time.LocalDateTime time);
}
