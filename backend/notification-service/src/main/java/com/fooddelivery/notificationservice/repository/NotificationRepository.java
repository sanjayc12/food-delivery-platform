package com.fooddelivery.notificationservice.repository;

import com.fooddelivery.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByOrderIdOrderBySentAtAsc(Long orderId);
}