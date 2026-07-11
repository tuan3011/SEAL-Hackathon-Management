package com.example.swp.features.notification;

import com.example.swp.features.notification.dto.response.NotificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Quản lý kết nối SSE (Server-Sent Events) cho real-time notification.
 *
 * === TẠI SAO CHỌN SSE THAY VÌ WEBSOCKET? ===
 *
 * | Tiêu chí           | Short Polling        | SSE                  | WebSocket            |
 * |---------------------|----------------------|----------------------|----------------------|
 * | Hướng giao tiếp     | Client → Server      | Server → Client      | Hai chiều            |
 * | Overhead            | Cao (request/30s)    | Thấp (1 connection)  | Thấp (1 connection)  |
 * | Độ phức tạp         | Đơn giản             | Trung bình           | Cao                  |
 * | Tự động reconnect   | N/A                  | ✅ Có sẵn            | ❌ Phải tự implement |
 * | Dùng HTTP chuẩn     | ✅                   | ✅                   | ❌ (upgrade protocol)|
 * | Phù hợp cho         | Cập nhật ít          | Push notification    | Chat, game           |
 *
 * Notification chỉ cần MỘT CHIỀU (server → client) → SSE là lựa chọn tối ưu.
 *
 * === CƠ CHẾ HOẠT ĐỘNG ===
 *
 * 1. Client gọi GET /api/v1/notifications/stream → nhận SseEmitter (HTTP connection giữ mở)
 * 2. Khi có notification mới → server push event qua connection đã mở
 * 3. Client nhận event real-time, KHÔNG cần polling
 * 4. Nếu connection đứt → browser tự động reconnect (EventSource API)
 *
 * === QUẢN LÝ BỘ NHỚ ===
 *
 * - Dùng ConcurrentHashMap<userId, SseEmitter> để lưu connection
 * - Mỗi user chỉ có 1 connection active (tab mới → thay thế tab cũ)
 * - SseEmitter có timeout → tự hủy sau thời gian không hoạt động
 * - Callback onCompletion/onTimeout/onError → tự dọn dẹp
 */
@Slf4j
@Service
@SuppressWarnings("null")
public class SseEmitterService {

    /**
     * Map lưu trữ connection SSE của từng user.
     * Key: userId, Value: SseEmitter (HTTP connection đang mở)
     *
     * ConcurrentHashMap đảm bảo thread-safe khi nhiều user subscribe/unsubscribe đồng thời.
     */
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    /** Thời gian timeout cho SSE connection: 30 phút. Sau đó client tự reconnect. */
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;

    /**
     * Đăng ký SSE connection cho user.
     * Trả về SseEmitter mà controller sẽ return cho client.
     *
     * @param userId ID của user đang subscribe
     * @return SseEmitter — HTTP connection giữ mở để push events
     */
    public SseEmitter subscribe(Long userId) {
        // Nếu user đã có connection cũ → đóng nó (tránh zombie connection)
        SseEmitter existingEmitter = emitters.get(userId);
        if (existingEmitter != null) {
            existingEmitter.complete();
            emitters.remove(userId);
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // Callbacks tự dọn dẹp khi connection kết thúc
        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.debug("SSE connection completed for userId={}", userId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            log.debug("SSE connection timed out for userId={}", userId);
        });
        emitter.onError(throwable -> {
            emitters.remove(userId);
            log.debug("SSE connection error for userId={}: {}", userId, throwable.getMessage());
        });

        emitters.put(userId, emitter);
        log.info("SSE connection established for userId={} (total active: {})", userId, emitters.size());

        // Gửi event kết nối thành công để client biết connection đã sẵn sàng
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("SSE connection established"));
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(userId);
        }

        return emitter;
    }

    /**
     * Push notification real-time đến user qua SSE.
     * Nếu user không online (không có connection) → bỏ qua im lặng (notification đã lưu DB rồi).
     *
     * @param userId  ID user nhận notification
     * @param notification Notification response để push
     */
    public void pushNotification(Long userId, NotificationResponse notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            // User không online — notification đã lưu DB, user sẽ thấy khi mở app
            return;
        }

        try {
            emitter.send(SseEmitter.event()
                    .name("NOTIFICATION")
                    .data(notification));
            log.debug("Pushed notification id={} to userId={} via SSE", notification.getId(), userId);
        } catch (IOException e) {
            // Connection đã đứt — dọn dẹp
            emitters.remove(userId);
            log.debug("Failed to push to userId={}, removing emitter: {}", userId, e.getMessage());
        }
    }

    /**
     * Push cập nhật số notification chưa đọc.
     * Frontend dùng để cập nhật badge count trên icon chuông.
     */
    public void pushUnreadCount(Long userId, long count) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) return;

        try {
            emitter.send(SseEmitter.event()
                    .name("UNREAD_COUNT")
                    .data(Map.of("count", count)));
        } catch (IOException e) {
            emitters.remove(userId);
        }
    }

    /** Số lượng connection đang active — dùng cho monitoring/debug */
    public int getActiveConnectionCount() {
        return emitters.size();
    }
}
