package com.example.swp.features.hackathon_event.listener;

import com.example.swp.features.event_registration.EventRegistration;
import com.example.swp.features.event_registration.EventRegistrationRepository;
import com.example.swp.features.event_registration.EventRegistrationStatus;
import com.example.swp.features.hackathon_event.event.HackathonCompletedEvent;
import com.example.swp.features.notification.NotificationSender;
import com.example.swp.features.ranking.dto.TeamRankingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

/**
 * Listener xử lý các sự kiện liên quan đến HackathonEvent.
 *
 * QUAN TRỌNG — Tại sao phải là class RIÊNG (không nằm trong HackathonEventServiceImpl)?
 * → Spring AOP Proxy: @Async chỉ hoạt động khi method được gọi TỪ BÊN NGOÀI class.
 *   Nếu đặt trong cùng class với publisher → self-invocation → bypass proxy → @Async không hoạt động.
 *
 * Luồng hoạt động:
 *   1. HackathonEventServiceImpl commit transaction (status = COMPLETED)
 *   2. Spring detect AFTER_COMMIT → dispatch HackathonCompletedEvent đến listener này
 *   3. @Async → listener chạy trên thread riêng ("notificationExecutor" pool)
 *   4. Listener query registrations, build message, gửi notification qua NotificationSender (có retry)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HackathonEventListener {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final NotificationSender notificationSender;

    /**
     * Xử lý khi một HackathonEvent chuyển sang trạng thái COMPLETED.
     * Gửi notification kết quả top 1-2-3 cho tất cả người đã đăng ký.
     *
     * @Async("notificationExecutor") — chạy trên thread pool riêng, không block HTTP response.
     * @TransactionalEventListener(phase = AFTER_COMMIT) — chỉ chạy SAU KHI transaction commit thành công.
     *   → Nếu transaction rollback, method này KHÔNG được gọi → đảm bảo data consistency.
     */
    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleHackathonCompleted(HackathonCompletedEvent event) {
        log.info("Handling HackathonCompletedEvent — eventId={}, eventName='{}'",
                event.getEventId(), event.getEventName());

        try {
            // Build notification content từ top-3 rankings
            String title = "🏆 Kết quả " + event.getEventName();
            String message = buildTop3Message(event.getEventName(), event.getTop3Rankings());

            // Lấy tất cả người đã đăng ký event
            List<EventRegistration> registrations = eventRegistrationRepository.findByEventId(event.getEventId());

            int successCount = 0;
            int skipCount = 0;

            for (EventRegistration reg : registrations) {
                // Chỉ gửi cho người có status REGISTERED (bỏ qua CANCELLED)
                if (reg.getStatus() != EventRegistrationStatus.REGISTERED) {
                    skipCount++;
                    continue;
                }

                // Gửi qua NotificationSender (có @Retryable tự động retry 3 lần)
                notificationSender.sendSingleNotification(
                        reg.getUser(),
                        title,
                        message,
                        "EVENT_RESULT",
                        "HACKATHON_EVENT",
                        event.getEventId()
                );
                successCount++;
            }

            log.info("Completion notifications sent for eventId={}: {} sent, {} skipped (cancelled)",
                    event.getEventId(), successCount, skipCount);

        } catch (Exception e) {
            // Log lỗi nhưng KHÔNG throw — vì không có ai catch trong async context
            log.error("Fatal error sending completion notifications for eventId={}: {}",
                    event.getEventId(), e.getMessage(), e);
        }
    }

    /**
     * Build nội dung thông báo top 1-2-3.
     * Xử lý edge case: event có ít hơn 3 team.
     */
    private String buildTop3Message(String eventName, List<TeamRankingResponse> top3) {
        if (top3 == null || top3.isEmpty()) {
            return "Hackathon \"" + eventName + "\" đã kết thúc. Chưa có kết quả xếp hạng.";
        }

        String[] medals = {"🥇", "🥈", "🥉"};

        StringBuilder sb = new StringBuilder();
        sb.append("Kết quả chung cuộc Hackathon \"").append(eventName).append("\":\n\n");

        for (int i = 0; i < top3.size() && i < 3; i++) {
            TeamRankingResponse team = top3.get(i);
            sb.append(String.format("%s Top %d: %s — %.2f điểm\n",
                    medals[i],
                    team.getRank(),
                    team.getTeamName(),
                    team.getFinalScore()));
        }

        sb.append("\nChúc mừng các đội chiến thắng! 🎉");
        return sb.toString();
    }
}
