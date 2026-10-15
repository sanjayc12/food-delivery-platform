package com.fooddelivery.deliveryservice.service;

import com.fooddelivery.deliveryservice.dto.DeliveryResponse;
import com.fooddelivery.deliveryservice.entity.Delivery;
import com.fooddelivery.deliveryservice.entity.DeliveryStatus;
import com.fooddelivery.deliveryservice.exception.DeliveryNotFoundException;
import com.fooddelivery.deliveryservice.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new DeliveryNotFoundException(orderId));

        return new DeliveryResponse(
                delivery.getOrderId(),
                delivery.getDeliveryPartnerName(),
                delivery.getStatus(),
                delivery.getAssignedAt()
        );
    }

    public DeliveryResponse updateStatus(Long orderId, DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new DeliveryNotFoundException(orderId));
        delivery.setStatus(status);
        deliveryRepository.save(delivery);

        return new DeliveryResponse(
                delivery.getOrderId(),
                delivery.getDeliveryPartnerName(),
                delivery.getStatus(),
                delivery.getAssignedAt()
        );
    }
}