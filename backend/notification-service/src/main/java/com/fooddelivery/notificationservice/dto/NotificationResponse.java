package com.fooddelivery.notificationservice.dto;

import com.fooddelivery.notificationservice.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {
    private Long orderId;
    private NotificationType type;
    private String message;
    private LocalDateTime sentAt;
}