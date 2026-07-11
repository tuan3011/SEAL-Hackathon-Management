package com.example.swp.features.notification;

import com.example.swp.common.ApiResponse;
import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.notification.dto.response.NotificationResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterService sseEmitterService;
    private final UserRepository userRepository;

    // ==================== SSE STREAM ====================

    /**
     * Endpoint SSE (Server-Sent Events) — real-time notification stream.
     *
     * Frontend sử dụng EventSource API:
     * ```javascript
     * const eventSource = new EventSource('/api/v1/notifications/stream', {
     *     headers: { 'Authorization': 'Bearer ' + token }
     * });
     *
     * eventSource.addEventListener('NOTIFICATION', (event) => {
     *     const notification = JSON.parse(event.data);
     *     showNotificationPopup(notification);
     * });
     *
     * eventSource.addEventListener('UNREAD_COUNT', (event) => {
     *     const data = JSON.parse(event.data);
     *     updateBadgeCount(data.count);
     * });
     *
     * eventSource.addEventListener('CONNECTED', () => {
     *     console.log('SSE connected');
     * });
     * ```
     *
     * Lưu ý: EventSource API không hỗ trợ custom headers.
     * Nếu dùng JWT, frontend cần truyền token qua query param:
     *   GET /api/v1/notifications/stream?token=xxx
     * Hoặc dùng thư viện fetch-event-source hỗ trợ custom headers.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        User currentUser = getCurrentUser();
        return sseEmitterService.subscribe(currentUser.getId());
    }

    // ==================== REST API (giữ nguyên) ====================

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(Pageable pageable) {
        Page<NotificationResponse> notifications = notificationService.getMyNotifications(pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadNotificationCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        NotificationResponse notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read."));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read."));
    }

    // ==================== PRIVATE HELPERS ====================

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
