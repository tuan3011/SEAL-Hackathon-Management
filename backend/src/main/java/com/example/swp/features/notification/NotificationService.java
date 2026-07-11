package com.example.swp.features.notification;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.notification.dto.response.NotificationResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseEmitterService sseEmitterService;

    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User currentUser = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadNotificationCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(currentUser.getId());
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to update this notification.");
        }

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsReadForUser(currentUser);
    }

    // Method for other services to create notifications
    public void createNotification(User user, String title, String message, String type, String refType, Long refId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Push real-time qua SSE (nếu user đang online)
        sseEmitterService.pushNotification(user.getId(), mapToResponse(saved));
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        sseEmitterService.pushUnreadCount(user.getId(), unreadCount);
    }

    public void createNotifications(java.util.List<User> users, String title, String message, String type, String refType, Long refId) {
        java.util.List<Notification> notifications = users.stream().map(user -> Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .build()).collect(java.util.stream.Collectors.toList());
        
        java.util.List<Notification> savedList = notificationRepository.saveAll(notifications);

        for (Notification saved : savedList) {
            sseEmitterService.pushNotification(saved.getUser().getId(), mapToResponse(saved));
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(saved.getUser().getId());
            sseEmitterService.pushUnreadCount(saved.getUser().getId(), unreadCount);
        }
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
