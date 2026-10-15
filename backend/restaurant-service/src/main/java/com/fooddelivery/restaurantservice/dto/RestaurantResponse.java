package com.fooddelivery.restaurantservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String cuisine;
    private String address;
    private Double rating;
    private boolean isOpen;
}