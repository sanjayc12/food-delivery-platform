package com.fooddelivery.deliveryservice.kafka;

import com.fooddelivery.deliveryservice.entity.Delivery;
import com.fooddelivery.deliveryservice.entity.DeliveryStatus;
import com.fooddelivery.deliveryservice.event.DeliveryAssignedEvent;
import com.fooddelivery.deliveryservice.event.PaymentCompletedEvent;
import com.fooddelivery.deliveryservice.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaymentEventConsumer {

    private static final String DELIVERY_TOPIC = "delivery-assigned-topic";

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private KafkaTemplate<String, DeliveryAssignedEvent> kafkaTemplate;

    @KafkaListener(topics = "payment-completed-topic", groupId = "delivery-service-group",
    	    properties = "spring.json.value.default.type=com.fooddelivery.deliveryservice.event.PaymentCompletedEvent")
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        boolean cashOnDelivery = "COD".equals(event.getPaymentMethod());
        if (!"SUCCESS".equals(event.getPaymentStatus()) && !cashOnDelivery) {
            return; // don't assign delivery for failed/pending payments
        }

        Delivery delivery = new Delivery();
        delivery.setOrderId(event.getOrderId());
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        deliveryRepository.save(delivery);

        DeliveryAssignedEvent deliveryEvent = new DeliveryAssignedEvent(
                event.getOrderId(),
                delivery.getStatus().name()
        );
        kafkaTemplate.send(DELIVERY_TOPIC, event.getOrderId().toString(), deliveryEvent);
    }
}