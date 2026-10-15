package com.fooddelivery.paymentservice.service;

import com.fooddelivery.paymentservice.dto.PaymentResponse;
import com.fooddelivery.paymentservice.entity.Payment;
import com.fooddelivery.paymentservice.entity.PaymentMethod;
import com.fooddelivery.paymentservice.entity.PaymentStatus;
import com.fooddelivery.paymentservice.event.PaymentCompletedEvent;
import com.fooddelivery.paymentservice.exception.PaymentNotFoundException;
import com.fooddelivery.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class PaymentService {

    private static final String PAYMENT_TOPIC = "payment-completed-topic";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private KafkaTemplate<String, PaymentCompletedEvent> kafkaTemplate;

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse selectPaymentMethod(Long orderId, PaymentMethod method, BigDecimal amount) {
        Payment payment = paymentRepository.findByOrderId(orderId).orElseGet(() -> {
            Payment newPayment = new Payment();
            newPayment.setOrderId(orderId);
            newPayment.setAmount(amount);
            newPayment.setStatus(PaymentStatus.PENDING);
            return newPayment;
        });
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This payment is no longer pending.");
        }

        payment.setPaymentMethod(method.name());
        payment.setStatus(PaymentStatus.SUCCESS);
        Payment saved = paymentRepository.save(payment);

        PaymentCompletedEvent event = new PaymentCompletedEvent(
                saved.getOrderId(),
                saved.getStatus().name(),
                saved.getPaymentMethod()
        );
        kafkaTemplate.send(PAYMENT_TOPIC, saved.getOrderId().toString(), event);
        return toResponse(saved);
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getOrderId(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getProcessedAt(),
                payment.getPaymentMethod()
        );
    }
}