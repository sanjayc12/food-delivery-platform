# FoodRush - React frontend

Responsive (mobile-first) React 18 + Vite client for the Real-Time Food Delivery & Order Tracking Platform.
It talks **only to the API Gateway** (`/api/**`), which does JWT validation and routes to the microservices.

## Features

| Workflow step | Screen |
|---|---|
| Register / Login (JWT) | `/register`, `/login` |
| Browse restaurants, search, cuisine + "open now" filters | `/` |
| About and contact information | `/about`, `/contact` |
| Browse menu, veg filter, add to cart | `/restaurants/:id` |
| Cart (saved separately for each signed-in account; single-restaurant) | slide-in drawer |
| Place order with an account-specific saved delivery address, then choose a payment method | `/checkout`, `/orders/:id` |
| Order placed -> payment completed -> live tracking -> delivered (polls every 4 s) | `/orders/:id` |
| Order history | `/orders` |
| Admin catalogue management: add restaurants/dishes, load sample data | `/manage` |

Also: loading skeletons, empty and error states, toast messages, automatic sign-out when the token expires or the
gateway returns 401, light/dark theme (follows the OS), reduced-motion support, mobile tab bar.

UPI, card, and cash-on-delivery confirmation are simulated in this demo and do not charge or collect money.
Choose a payment method in the order details after placing the order to start delivery tracking.

## Run it

Prerequisites: Node 18+ and the backend running (Eureka, Config Server, all services, API Gateway on `:8080`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

In development Vite proxies `/api` to `http://localhost:8080`, so **no CORS setup is needed**.
Change the gateway address with `VITE_GATEWAY_URL` (copy `.env.example` to `.env`).

Production build: `npm run build` (output in `dist/`). Serve `dist/` from the same origin as the gateway, or set
`VITE_API_BASE_URL=https://your-gateway` and enable CORS on the gateway (see below).

## Admin demo account

When the user-service starts, it ensures the configured admin account has the `ADMIN` role and configured password
(creating the account if needed):

- Username: `admin`
- Password: `1234`

These are development/demo credentials. Set `FOODRUSH_ADMIN_USERNAME`, `FOODRUSH_ADMIN_PASSWORD`, and
`FOODRUSH_ADMIN_EMAIL` in the user-service environment before deployment. Restart the user-service after changing
these values or updating the service code. Signing in with the configured admin username and password also ensures
that account receives an `ADMIN` role in the login response, so a previously registered customer account can access
**Manage** after signing out and signing in again. The navbar only displays **Manage** to admin users, the frontend
guards `/manage`, and the API Gateway rejects non-admin requests that try to create restaurants or menu items.

## First run checklist

1. Start the backend services, including the user-service and API Gateway.
2. Open http://localhost:5173 and sign in as the admin demo account above.
3. Home shows "No restaurants yet" -> click **Load sample restaurants** in **Manage**.
4. Create a customer account, then browse restaurants, add dishes, and place an order.
5. The tracking page updates by itself as Kafka events flow: Payment confirmed -> Delivery partner assigned.
   Use **Simulate delivery** to move it to Out for delivery / Delivered.

## Backend notes (two small changes recommended)

**1. Return the user id from login** (the order needs a `customerId`). Until you do this the frontend sends `customerId: 1`.

```java
// dto/AuthResponse.java
@Getter @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String role;
    private Long userId;          // add
}
// UserService.login(...)
return new AuthResponse(token, user.getUsername(), user.getRole(), user.getId());
```
The frontend already reads `userId` from the response, no frontend change needed.

**2. CORS on the gateway** - only needed if the built frontend is served from a different origin than the gateway:

```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedOrigins=http://localhost:5173
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedMethods=GET,POST,PUT,DELETE,OPTIONS
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedHeaders=*
```
Also let CORS pre-flight through your `JwtAuthenticationFilter` by skipping `OPTIONS` requests.

Known limits (backend, not frontend): there is no "list my orders" endpoint, so order history is remembered per
browser; item details on the tracking page also come from that browser's saved copy.

## Structure

```
src/
  api/client.js          axios + JWT interceptor + every endpoint in one place
  api/sample.js          sample restaurants/dishes
  context/               Auth, Cart, Toast providers
  components/            Navbar, BottomNav, CartDrawer, cards, StatusTimeline, states
  pages/                 Login, Register, Home, RestaurantMenu, Checkout, Orders, OrderTracking, Manage
  styles/index.css       design tokens + all styles
```
