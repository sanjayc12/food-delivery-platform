package com.fooddelivery.restaurantservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestaurantRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String cuisine;

    @NotBlank
    private String address;
}