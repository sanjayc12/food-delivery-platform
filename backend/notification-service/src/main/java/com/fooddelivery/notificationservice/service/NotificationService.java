package com.fooddelivery.notificationservice.service;

import com.fooddelivery.notificationservice.dto.NotificationResponse;
import com.fooddelivery.notificationservice.entity.Notification;
import com.fooddelivery.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<NotificationResponse> getNotificationsForOrder(Long orderId) {
        return notificationRepository.findByOrderIdOrderBySentAtAsc(orderId)
                .stream()
                .map(n -> new NotificationResponse(n.getOrderId(), n.getType(), n.getMessage(), n.getSentAt()))
                .collect(Collectors.toList());
    }
}