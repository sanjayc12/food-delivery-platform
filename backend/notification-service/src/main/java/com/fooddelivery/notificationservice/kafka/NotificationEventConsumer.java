package com.fooddelivery.notificationservice.kafka;

import com.fooddelivery.notificationservice.entity.Notification;
import com.fooddelivery.notificationservice.entity.NotificationType;
import com.fooddelivery.notificationservice.event.DeliveryAssignedEvent;
import com.fooddelivery.notificationservice.event.OrderPlacedEvent;
import com.fooddelivery.notificationservice.event.PaymentCompletedEvent;
import com.fooddelivery.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventConsumer.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @KafkaListener(topics = "order-placed-topic", groupId = "notification-service-group",
        properties = "spring.json.value.default.type=com.fooddelivery.notificationservice.event.OrderPlacedEvent")
    public void onOrderPlaced(OrderPlacedEvent event) {
        String message = "Your order #" + event.getOrderId() + " has been placed successfully. Total: ₹" + event.getTotalAmount();
        save(event.getOrderId(), NotificationType.ORDER_PLACED, message);
        logger.info("NOTIFICATION: {}", message);
        // TODO: integrate real email/SMS/push provider here
    }

    @KafkaListener(topics = "payment-completed-topic", groupId = "notification-service-group",
        properties = "spring.json.value.default.type=com.fooddelivery.notificationservice.event.PaymentCompletedEvent")
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        String message = "COD".equals(event.getPaymentMethod())
                ? "Cash on delivery selected for order #" + event.getOrderId()
                : "Payment " + event.getPaymentStatus() + " for order #" + event.getOrderId();
        save(event.getOrderId(), NotificationType.PAYMENT_COMPLETED, message);
        logger.info("NOTIFICATION: {}", message);
    }

    @KafkaListener(topics = "delivery-assigned-topic", groupId = "notification-service-group",
        properties = "spring.json.value.default.type=com.fooddelivery.notificationservice.event.DeliveryAssignedEvent")
    public void onDeliveryAssigned(DeliveryAssignedEvent event) {
        String message = "A delivery partner has been assigned for order #" + event.getOrderId();
        save(event.getOrderId(), NotificationType.DELIVERY_ASSIGNED, message);
        logger.info("NOTIFICATION: {}", message);
    }

    private void save(Long orderId, NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setOrderId(orderId);
        notification.setType(type);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }
}