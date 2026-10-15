package com.fooddelivery.deliveryservice.exception;

public class DeliveryNotFoundException extends RuntimeException {
    public DeliveryNotFoundException(Long orderId) {
        super("No delivery found for order id: " + orderId);
    }
}