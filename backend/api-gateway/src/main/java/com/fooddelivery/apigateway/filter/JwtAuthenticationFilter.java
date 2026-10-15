package com.fooddelivery.apigateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    // Must match the SECRET in User Service's JwtUtil exactly
    private static final String SECRET = "ChangeThisToALongRandomSecretKeyForFoodDeliveryPlatform123456";
    private static final SecretKey KEY = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Endpoints that don't require a token
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/users/login",
            "/api/users/register"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (OPEN_ENDPOINTS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);

        try {
            String role = Jwts.parser().verifyWith(KEY).build()
                    .parseSignedClaims(token).getPayload().get("role", String.class);
            String normalizedRole = role == null ? "" : role.replaceFirst("(?i)^ROLE_", "");
            if (isRestaurantManagementRequest(request) && !"ADMIN".equalsIgnoreCase(normalizedRole)) {
                return forbidden(exchange);
            }
            return chain.filter(exchange);
        } catch (Exception e) {
            return unauthorized(exchange);
        }
    }

    private boolean isRestaurantManagementRequest(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        return HttpMethod.POST.equals(request.getMethod())
                && ("/api/restaurants".equals(path)
                || path.matches("/api/restaurants/\\d+/items"));
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // runs before routing
    }
}