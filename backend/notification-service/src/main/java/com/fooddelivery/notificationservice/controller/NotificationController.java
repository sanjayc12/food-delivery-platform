package com.fooddelivery.notificationservice.controller;

import com.fooddelivery.notificationservice.dto.NotificationResponse;
import com.fooddelivery.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/order/{orderId}")
    public List<NotificationResponse> getNotifications(@PathVariable Long orderId) {
        return notificationService.getNotificationsForOrder(orderId);
    }
}