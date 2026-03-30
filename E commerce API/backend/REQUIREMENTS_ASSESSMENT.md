# E-Commerce API - Requirements Assessment Report

## Summary
Overall fulfillment is approximately 75-80% for core CRUD and checkout flow. Product, cart, order, and payment services are implemented, but there are high-impact gaps in auth behavior, customer management correctness, and production-grade payment/security practices.

---

## 1. Customer/Auth Service

### Implemented
- Customer registration endpoint: `POST /api/v1/customers/`
- Login endpoint with JWT issuance: `POST /api/v1/customers/login`
- Customer read endpoints:
  - `GET /api/v1/customers/`
  - `GET /api/v1/customers/:id`
  - `GET /api/v1/customers/getcount`
- Password hashing with bcrypt

### Missing or Risky
- No profile update endpoint (`PUT/PATCH /customers/:id`)
- No password change/reset flow
- No email verification, logout, or token revocation list
- No Customer service abstraction (`services/customerService.js`)

### Critical Findings
- Registration path mismatch in JWT allow-list:
  - Auth excludes `.../customers/register`, but implemented route is `POST .../customers/`.
  - Result: registration may be blocked by global JWT middleware.
- Customer delete route uses `Product.findByIdAndDelete` instead of `Customer.findByIdAndDelete`.

---

## 2. Product & Category Service

### Implemented
- Product service abstraction (`services/productService.js`)
- Product endpoints:
  - `GET /api/v1/products/` (category filter via query)
  - `GET /api/v1/products/:id`
  - `GET /api/v1/products/getfeatured/:count`
  - `GET /api/v1/products/getcount`
  - `POST /api/v1/products/`
  - `PUT /api/v1/products/:id`
  - `DELETE /api/v1/products/:id`
- Category endpoints:
  - `GET /api/v1/categories/`
  - `GET /api/v1/categories/:id`
  - `POST /api/v1/categories/`
  - `PUT /api/v1/categories/:id`
  - `DELETE /api/v1/categories/:id`
- Inventory field exists: `Instock`
- Rating/review aggregate fields exist: `rating`, `numReviews`

### Missing or Incomplete
- No stock validation while adding to cart or creating orders
- No stock decrement during order creation
- No product search beyond category filter
- No dedicated review endpoints
- No pagination/sorting standard across product list responses

### Important Note
- Product create route expects `req.file` but upload middleware is not attached in the route, so file upload behavior appears incomplete.

---

## 3. Cart Service

### Implemented
- Cart service abstraction (`services/cartService.js`)
- Endpoints:
  - `GET /api/v1/cart/:customerId`
  - `POST /api/v1/cart/add`
  - `PUT /api/v1/cart/update/:cartItemId`
  - `DELETE /api/v1/cart/remove/:cartItemId`
  - `DELETE /api/v1/cart/clear/:customerId`
- Quantity validation and object-id validation in service
- Cart totals calculated at retrieval
- TTL expiration enabled (`dateAdded` expires in 30 days)

### Missing or Incomplete
- No cart-level stock verification against product inventory
- No cart endpoint pagination (not mandatory now, but needed at scale)

---

## 4. Order Service

### Implemented
- Order service abstraction (`services/orderService.js`)
- Endpoints:
  - `GET /api/v1/orders/`
  - `GET /api/v1/orders/:id`
  - `GET /api/v1/orders/customer/:customerId`
  - `POST /api/v1/orders/from-cart/create`
  - `POST /api/v1/orders/` (legacy create)
  - `PUT /api/v1/orders/:id` (status update)
  - `DELETE /api/v1/orders/:id`
- Order item model and population included
- Cart cleanup after order-from-cart creation

### Missing or Incomplete
- No stock decrement after successful order creation
- No status transition rules (any status string can be applied)
- No order cancellation policy workflow
- No shipment/tracking integration
- No pagination/filtering for order list endpoints

### Data Model Issue
- In `model/order.js`, `datecreated` uses `deafault` (typo) instead of `default`, so auto timestamp behavior is broken.

---

## 5. Payment Service

### Implemented
- Payment service abstraction (`services/paymentService.js`)
- Endpoints:
  - `POST /api/v1/payments/`
  - `GET /api/v1/payments/`
  - `GET /api/v1/payments/:id`
  - `GET /api/v1/payments/customer/:customerId`
  - `GET /api/v1/payments/order/:orderId`
  - `POST /api/v1/payments/:id/process`
  - `PATCH /api/v1/payments/:id/status`
  - `POST /api/v1/payments/:id/refund`
  - `GET /api/v1/payments/stats/report`
- Payment method validation and basic card/email/UPI format checks
- Refund flow and payment statistics aggregation

### Missing or Risky
- No real gateway integration (Stripe/PayPal SDK/API not wired)
- Card and CVV data are stored in plain fields (not encrypted/tokenized)
- No webhook verification flow for external provider events
- No idempotency keys for payment creation/processing
- Limited compliance posture for PCI DSS requirements

---

## Cross-Cutting Architecture Assessment

### Service Layer
- Implemented for product, cart, order, payment
- Missing for customer/auth domain

### Middleware and Auth
- Global JWT middleware enabled
- Current `isRevoked` logic effectively blocks all non-admin tokens from protected routes
- Public route allow-list does not align with current registration endpoint

### Error Handling
- Inconsistent response format between routes
- Central error handler only handles `UnauthorizedError`; other errors are route-local

### Validation
- Mostly ad-hoc validation inside route/service methods
- No centralized schema validation (Joi/Zod/express-validator)

### Testing & Docs
- No automated tests currently configured in package scripts
- No OpenAPI/Swagger specification yet

---

## Updated Coverage Matrix

| Feature | Status | Notes |
|---|---|---|
| Customer registration | ⚠️ | Implemented route exists, but auth allow-list mismatch can block it |
| Customer login | ✅ | JWT token generated |
| Customer profile update | ❌ | No endpoint |
| Customer delete | ❌ | Bug: deletes Product instead of Customer |
| Product CRUD | ✅ | Service-based implementation |
| Category CRUD | ✅ | Implemented |
| Product filtering | ⚠️ | Category filter only |
| Cart add/view/update/remove/clear | ✅ | Service-based implementation |
| Cart TTL expiration | ✅ | 30 days |
| Order create from cart | ✅ | Implemented |
| Order status update | ✅ | `PUT /orders/:id` |
| Order cancellation workflow | ⚠️ | Hard delete exists; business cancellation flow not defined |
| Inventory decrement | ❌ | Not implemented |
| Payment CRUD/processing/refund/stats | ✅ | Service-based, simulated processing |
| Real payment gateway integration | ❌ | Not implemented |
| Payment data security posture | ❌ | Sensitive data not tokenized/encrypted |

---

## Prioritized Action Plan

### High Priority
1. Fix auth allow-list for customer registration route.
2. Fix customer delete handler to use `Customer` model.
3. Implement inventory validation/decrement in cart/order workflows.
4. Fix order schema `datecreated` default typo.
5. Add centralized request validation for major write endpoints.

### Medium Priority
1. Add customer profile update and password change endpoints.
2. Add status transition rules for orders and payments.
3. Standardize API response and error contracts.
4. Add pagination/filtering for products and orders.

### Low Priority
1. Add product review endpoints and moderation rules.
2. Add email notifications (order confirmation, status updates).
3. Add analytics/reporting expansion beyond payments.

---

## Recommended Near-Term Deliverables (Next Sprint)

1. Auth fixes + customer delete bug fix
2. Inventory-safe checkout (stock check + decrement + rollback safety)
3. Validation middleware rollout (customer/order/payment write routes)
4. Basic test suite for services (cart/order/payment)
5. OpenAPI skeleton for all existing endpoints

---

**Last Updated**: March 30, 2026
