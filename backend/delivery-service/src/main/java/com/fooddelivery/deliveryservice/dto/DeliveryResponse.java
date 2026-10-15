package com.fooddelivery.deliveryservice.dto;

import com.fooddelivery.deliveryservice.entity.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DeliveryResponse {
    private Long orderId;
    private String deliveryPartnerName;
    private DeliveryStatus status;
    private LocalDateTime assignedAt;
}