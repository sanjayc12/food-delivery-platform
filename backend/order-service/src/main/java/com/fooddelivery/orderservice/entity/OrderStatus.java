package com.fooddelivery.orderservice.entity;

public enum OrderStatus {
    PLACED,
    PAYMENT_PENDING,
    PAYMENT_CONFIRMED,
    PAYMENT_FAILED,
    CONFIRMED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}