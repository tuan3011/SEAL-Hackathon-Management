package com.example.swp.features.notification;

import com.example.swp.features.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

/**
 * Service gửi notification với cơ chế tự động retry.
 *
 * Tại sao cần class riêng thay vì đặt @Retryable trong NotificationService?
 * → Spring AOP Proxy: @Retryable chỉ hoạt động khi method được gọi TỪ BÊN NGOÀI class.
 *   Nếu đặt trong cùng class rồi gọi this.method() → bypass proxy → retry không hoạt động.
 *
 * Retry strategy: Exponential backoff
 *   - Lần 1: chờ 1 giây
 *   - Lần 2: chờ 2 giây (1s × multiplier 2)
 *   - Lần 3: chờ 4 giây (2s × multiplier 2)
 *   - Sau 3 lần thất bại → gọi @Recover method
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSender {

    private final NotificationService notificationService;

    /**
     * Gửi notification cho 1 user. Tự động retry tối đa 3 lần nếu thất bại.
     */
    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public void sendSingleNotification(User user, String title, String message,
                                       String type, String referenceType, Long referenceId) {
        notificationService.createNotification(user, title, message, type, referenceType, referenceId);
    }

    /**
     * Fallback method — được gọi khi tất cả retry đều thất bại.
     * Ghi log error để monitoring. KHÔNG throw exception để không ảnh hưởng các notification khác.
     */
    @Recover
    public void recoverFailedNotification(Exception e, User user, String title, String message,
                                          String type, String referenceType, Long referenceId) {
        log.error("ALL retries exhausted — Failed to send notification to userId={}. " +
                        "Title='{}', Type='{}', RefType='{}', RefId={}. Error: {}",
                user.getId(), title, type, referenceType, referenceId, e.getMessage());
    }
}
