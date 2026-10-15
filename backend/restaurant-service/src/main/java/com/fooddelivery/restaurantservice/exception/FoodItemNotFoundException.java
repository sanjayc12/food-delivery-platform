package com.fooddelivery.restaurantservice.exception;

public class FoodItemNotFoundException extends RuntimeException {
    public FoodItemNotFoundException(Long id) {
        super("Food item not found with id: " + id);
    }
}