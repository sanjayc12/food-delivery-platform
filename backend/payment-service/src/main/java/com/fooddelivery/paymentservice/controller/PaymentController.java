package com.fooddelivery.paymentservice.controller;

import com.fooddelivery.paymentservice.dto.PaymentResponse;
import com.fooddelivery.paymentservice.dto.PaymentMethodRequest;
import com.fooddelivery.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    public PaymentResponse getPaymentByOrderId(@PathVariable Long orderId) {
        return paymentService.getPaymentByOrderId(orderId);
    }

    @PostMapping("/order/{orderId}/method")
    public ResponseEntity<PaymentResponse> selectPaymentMethod(
            @PathVariable Long orderId,
            @RequestBody PaymentMethodRequest request
    ) {
        if (request == null || request.paymentMethod() == null
                || request.amount() == null || request.amount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a payment method and provide a valid order amount.");
        }
        return ResponseEntity.ok(paymentService.selectPaymentMethod(
                orderId,
                request.paymentMethod(),
                request.amount()
        ));
    }
}