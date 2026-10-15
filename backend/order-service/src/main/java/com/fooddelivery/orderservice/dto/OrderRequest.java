package com.fooddelivery.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderRequest {

    @NotNull
    private Long customerId;

    @NotNull
    private Long restaurantId;

    private String paymentMethod;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    private String deliveryAddress;
}