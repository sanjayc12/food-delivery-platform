package com.fooddelivery.notificationservice.event;

public class PaymentCompletedEvent {
    private Long orderId;
    private String paymentStatus;
    private String paymentMethod;

    public PaymentCompletedEvent() {}

    public PaymentCompletedEvent(Long orderId, String paymentStatus, String paymentMethod) {
        this.orderId = orderId;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}