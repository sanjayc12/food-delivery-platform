package com.fooddelivery.paymentservice.event;

import java.math.BigDecimal;

public class OrderPlacedEvent {
    private Long orderId;
    private Long customerId;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;

    public OrderPlacedEvent() {}

    public OrderPlacedEvent(Long orderId, Long customerId, BigDecimal totalAmount, String status, String paymentMethod) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}