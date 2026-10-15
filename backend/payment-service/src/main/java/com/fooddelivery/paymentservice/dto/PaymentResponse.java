package com.fooddelivery.paymentservice.dto;

import com.fooddelivery.paymentservice.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PaymentResponse {
    private Long orderId;
    private BigDecimal amount;
    private PaymentStatus status;
    private LocalDateTime processedAt;
    private String paymentMethod;
}