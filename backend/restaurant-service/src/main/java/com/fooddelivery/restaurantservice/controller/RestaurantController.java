package com.fooddelivery.restaurantservice.controller;

import com.fooddelivery.restaurantservice.dto.*;
import com.fooddelivery.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> createRestaurant(@Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(request));
    }

    @GetMapping
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurant(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    @PostMapping("/{restaurantId}/items")
    public ResponseEntity<FoodItemResponse> addFoodItem(@PathVariable Long restaurantId, @Valid @RequestBody FoodItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.addFoodItem(restaurantId, request));
    }

    @GetMapping("/{restaurantId}/items")
    public List<FoodItemResponse> getMenu(@PathVariable Long restaurantId) {
        return restaurantService.getMenuByRestaurant(restaurantId);
    }

    @GetMapping("/items/{itemId}")
    public FoodItemResponse getFoodItem(@PathVariable Long itemId) {
        return restaurantService.getFoodItemById(itemId);
    }
}