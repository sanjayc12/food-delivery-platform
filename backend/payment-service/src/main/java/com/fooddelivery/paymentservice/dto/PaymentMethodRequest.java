package com.fooddelivery.paymentservice.dto;

import com.fooddelivery.paymentservice.entity.PaymentMethod;

import java.math.BigDecimal;

public record PaymentMethodRequest(
        PaymentMethod paymentMethod,
        BigDecimal amount
) {}
