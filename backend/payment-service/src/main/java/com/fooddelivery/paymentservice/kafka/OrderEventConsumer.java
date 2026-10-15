package com.fooddelivery.paymentservice.kafka;

import com.fooddelivery.paymentservice.entity.Payment;
import com.fooddelivery.paymentservice.entity.PaymentStatus;
import com.fooddelivery.paymentservice.event.OrderPlacedEvent;
import com.fooddelivery.paymentservice.event.PaymentCompletedEvent;
import com.fooddelivery.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventConsumer {

    private static final String PAYMENT_TOPIC = "payment-completed-topic";

    @Autowired private PaymentRepository paymentRepository;
    @Autowired private KafkaTemplate<String, PaymentCompletedEvent> kafkaTemplate;

    @KafkaListener(topics = "order-placed-topic", groupId = "payment-service-group",
        properties = "spring.json.value.default.type=com.fooddelivery.paymentservice.event.OrderPlacedEvent")
    public void handleOrderPlaced(OrderPlacedEvent event) {
        if (paymentRepository.findByOrderId(event.getOrderId()).isPresent()) {
            return; // already processed
        }
        boolean paymentSuccess = true; // TODO: real payment gateway
        Payment payment = new Payment();
        payment.setOrderId(event.getOrderId());
        payment.setAmount(event.getTotalAmount());
        payment.setStatus(paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        paymentRepository.save(payment);

        PaymentCompletedEvent paymentEvent =
            new PaymentCompletedEvent(event.getOrderId(), payment.getStatus().name());
        kafkaTemplate.send(PAYMENT_TOPIC, event.getOrderId().toString(), paymentEvent);
    }
}