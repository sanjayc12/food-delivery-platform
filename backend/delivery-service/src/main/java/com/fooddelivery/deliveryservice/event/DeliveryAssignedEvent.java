package com.fooddelivery.deliveryservice.event;

public class DeliveryAssignedEvent {
    private Long orderId;
    private String deliveryStatus;

    public DeliveryAssignedEvent() {}

    public DeliveryAssignedEvent(Long orderId, String deliveryStatus) {
        this.orderId = orderId;
        this.deliveryStatus = deliveryStatus;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
}