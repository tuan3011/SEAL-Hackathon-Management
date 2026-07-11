package com.example.swp.features.hackathon_event;

import java.util.Map;
import java.util.Set;

/**
 * Hackathon Event Lifecycle:
 *
 *   DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED
 *     ↓        ↓            ↓
 *   CANCELLED CANCELLED   CANCELLED
 *
 * - DRAFT:       Mới tạo, chưa công bố. Organizer còn đang chỉnh sửa.
 * - PUBLISHED:   Đã công bố, mở đăng ký cho participants.
 * - IN_PROGRESS: Hackathon đang diễn ra.
 * - COMPLETED:   Hackathon đã kết thúc. Terminal state.
 * - CANCELLED:   Hackathon bị hủy. Terminal state.
 */
public enum HackathonStatus {
    DRAFT,
    PUBLISHED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    private static final Map<HackathonStatus, Set<HackathonStatus>> VALID_TRANSITIONS = Map.of(
            DRAFT,       Set.of(PUBLISHED, CANCELLED),
            PUBLISHED,   Set.of(IN_PROGRESS, CANCELLED),
            IN_PROGRESS, Set.of(COMPLETED, CANCELLED),
            COMPLETED,   Set.of(),   // terminal state
            CANCELLED,   Set.of()    // terminal state
    );

    /**
     * Kiểm tra xem có thể chuyển sang trạng thái mới không.
     */
    public boolean canTransitionTo(HackathonStatus target) {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    /**
     * Trả về danh sách trạng thái hợp lệ tiếp theo.
     */
    public Set<HackathonStatus> getAllowedTransitions() {
        return VALID_TRANSITIONS.getOrDefault(this, Set.of());
    }
}
