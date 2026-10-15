# Real-Time Food Delivery & Order Tracking Platform

Microservices backend (Java 17, Spring Boot 3) + React frontend.

## Architecture
React (5173) → API Gateway (8080, JWT) → services discovered through Eureka.

| Service | Port | Role |
|---|---|---|
| eureka-server | 8761 | Service discovery |
| config-server | 8888 | Central configuration |
| api-gateway | 8080 | Routing + JWT validation |
| user-service | 8081 | Register / login, issues JWT |
| order-service | 8082 | Cart, place order, publishes `order-placed-topic` |
| payment-service | 8083 | Consumes order event, publishes `payment-completed-topic` |
| delivery-service | 8084 | Assigns rider, publishes `delivery-assigned-topic` |
| notification-service | 8085 | Consumes all events, stores notifications |
| restaurant-service | 8086 | Restaurants and menu |

Event flow: Order → Payment → Delivery → Notification (Kafka).

## Prerequisites
Java 17+, Maven, Node 18+, MySQL 8, Docker Desktop.

## Setup
1. Create the databases:
```sql
   CREATE DATABASE user_service_db;
   CREATE DATABASE restaurant_service_db;
   CREATE DATABASE order_service_db;
   CREATE DATABASE payment_service_db;
   CREATE DATABASE delivery_service_db;
   CREATE DATABASE notification_service_db;
```
2. Set your MySQL password (env var `DB_PASSWORD`, or edit each `application.properties`).
3. Start Kafka + ZooKeeper: `docker-compose up -d`
4. Start in this order (`mvn spring-boot:run` inside each folder):
   eureka-server → config-server → user, restaurant, order, payment, delivery, notification → api-gateway
5. Frontend:
```
   cd frontend
   npm install
   npm run dev      # http://localhost:5173
```

## Try it
Register → log in → "Load sample restaurants" → add dishes → place order → watch the tracking page update
(payment confirmed → delivery partner assigned).

## API (through the gateway, http://localhost:8080)
- `POST /api/users/register`, `POST /api/users/login`
- `GET/POST /api/restaurants`, `GET /api/restaurants/{id}/menu`
- `POST /api/orders`, `GET /api/orders/{id}`
- `GET /api/payments/order/{orderId}`
- `GET /api/delivery/order/{orderId}`
- `GET /api/notifications/order/{orderId}`

Send `Authorization: Bearer <token>` on everything except register and login.
