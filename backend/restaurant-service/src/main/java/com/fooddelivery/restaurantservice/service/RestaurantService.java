package com.fooddelivery.restaurantservice.service;

import com.fooddelivery.restaurantservice.dto.*;
import com.fooddelivery.restaurantservice.entity.FoodItem;
import com.fooddelivery.restaurantservice.entity.Restaurant;
import com.fooddelivery.restaurantservice.exception.FoodItemNotFoundException;
import com.fooddelivery.restaurantservice.exception.RestaurantNotFoundException;
import com.fooddelivery.restaurantservice.repository.FoodItemRepository;
import com.fooddelivery.restaurantservice.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setAddress(request.getAddress());
        restaurant.setRating(0.0);
        restaurant.setOpen(true);

        Restaurant saved = restaurantRepository.save(restaurant);
        return toResponse(saved);
    }

    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));
        return toResponse(restaurant);
    }

    public FoodItemResponse addFoodItem(Long restaurantId, FoodItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RestaurantNotFoundException(restaurantId));

        FoodItem item = new FoodItem();
        item.setRestaurant(restaurant);
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setVeg(request.isVeg());
        item.setAvailable(true);

        FoodItem saved = foodItemRepository.save(item);
        return toFoodItemResponse(saved);
    }

    public List<FoodItemResponse> getMenuByRestaurant(Long restaurantId) {
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new RestaurantNotFoundException(restaurantId);
        }
        return foodItemRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toFoodItemResponse)
                .collect(Collectors.toList());
    }

    public FoodItemResponse getFoodItemById(Long itemId) {
        FoodItem item = foodItemRepository.findById(itemId)
                .orElseThrow(() -> new FoodItemNotFoundException(itemId));
        return toFoodItemResponse(item);
    }

    private RestaurantResponse toResponse(Restaurant r) {
        return new RestaurantResponse(r.getId(), r.getName(), r.getCuisine(), r.getAddress(), r.getRating(), r.isOpen());
    }

    private FoodItemResponse toFoodItemResponse(FoodItem item) {
        return new FoodItemResponse(
                item.getId(),
                item.getRestaurant().getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable()
        );
    }
}