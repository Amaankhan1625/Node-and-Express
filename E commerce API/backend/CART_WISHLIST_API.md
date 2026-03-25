# Cart & Wishlist API Documentation

## Overview
This document describes the Cart and Wishlist features added to the E-commerce API. Users can now:
- Add products to a shopping cart
- Save products to a wishlist for later
- Move items between cart and wishlist
- Create orders from selected cart items

---

## Cart Endpoints

### 1. **Get Cart Items**
Retrieve all items in a customer's cart.

**Endpoint:** `GET /api/v1/cart/:customerId`

**Parameters:**
- `customerId` (path): Customer's MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "cart": [
    {
      "_id": "cartItemId",
      "product": {
        "_id": "productId",
        "name": "Product Name",
        "price": 99.99,
        "images": ["image_url"]
      },
      "quantity": 2,
      "customer": "customerId",
      "dateAdded": "2024-03-25T10:00:00Z",
      "itemTotal": 199.98
    }
  ],
  "totalItems": 1,
  "totalPrice": 199.98
}
```

---

### 2. **Add Item to Cart**
Add a product to the shopping cart. If the item already exists, quantity is updated.

**Endpoint:** `POST /api/v1/cart/add`

**Request Body:**
```json
{
  "productId": "mongodbObjectId",
  "customerId": "mongodbObjectId",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "cart": {
    "_id": "cartItemId",
    "product": "productId",
    "quantity": 2,
    "customer": "customerId",
    "dateAdded": "2024-03-25T10:00:00Z"
  }
}
```

---

### 3. **Update Cart Item Quantity**
Update the quantity of an item in the cart.

**Endpoint:** `PUT /api/v1/cart/update/:cartItemId`

**Parameters:**
- `cartItemId` (path): Cart item MongoDB ObjectId

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "cart": {
    "_id": "cartItemId",
    "product": { /* product details */ },
    "quantity": 5,
    "customer": "customerId"
  }
}
```

---

### 4. **Remove Item from Cart**
Remove a specific item from the cart.

**Endpoint:** `DELETE /api/v1/cart/remove/:cartItemId`

**Parameters:**
- `cartItemId` (path): Cart item MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### 5. **Clear Entire Cart**
Remove all items from a customer's cart.

**Endpoint:** `DELETE /api/v1/cart/clear/:customerId`

**Parameters:**
- `customerId` (path): Customer's MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "deletedCount": 5
}
```

---

## Wishlist Endpoints

### 1. **Get Wishlist Items**
Retrieve all items in a customer's wishlist.

**Endpoint:** `GET /api/v1/wishlist/:customerId`

**Parameters:**
- `customerId` (path): Customer's MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Wishlist retrieved successfully",
  "wishlist": [
    {
      "_id": "wishlistItemId",
      "product": {
        "_id": "productId",
        "name": "Product Name",
        "price": 149.99,
        "images": ["image_url"]
      },
      "customer": "customerId",
      "dateAdded": "2024-03-25T10:00:00Z"
    }
  ],
  "totalItems": 1
}
```

---

### 2. **Add Item to Wishlist**
Add a product to the wishlist.

**Endpoint:** `POST /api/v1/wishlist/add`

**Request Body:**
```json
{
  "productId": "mongodbObjectId",
  "customerId": "mongodbObjectId"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to wishlist successfully",
  "wishlist": {
    "_id": "wishlistItemId",
    "product": "productId",
    "customer": "customerId",
    "dateAdded": "2024-03-25T10:00:00Z"
  }
}
```

---

### 3. **Remove Item from Wishlist**
Remove a product from the wishlist.

**Endpoint:** `DELETE /api/v1/wishlist/remove/:wishlistItemId`

**Parameters:**
- `wishlistItemId` (path): Wishlist item MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Item removed from wishlist successfully"
}
```

---

### 4. **Clear Entire Wishlist**
Remove all items from a customer's wishlist.

**Endpoint:** `DELETE /api/v1/wishlist/clear/:customerId`

**Parameters:**
- `customerId` (path): Customer's MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Wishlist cleared successfully",
  "deletedCount": 3
}
```

---

### 5. **Move Item from Wishlist to Cart**
Move a product from wishlist directly to cart.

**Endpoint:** `POST /api/v1/wishlist/moveToCart/:wishlistItemId`

**Parameters:**
- `wishlistItemId` (path): Wishlist item MongoDB ObjectId

**Request Body:**
```json
{
  "customerId": "mongodbObjectId",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item moved from wishlist to cart successfully",
  "cart": {
    "_id": "cartItemId",
    "product": "productId",
    "quantity": 1,
    "customer": "customerId"
  }
}
```

---

## Order Endpoints (Updated)

### 1. **Create Order from Cart**
Create an order from selected cart items.

**Endpoint:** `POST /api/v1/orders/from-cart/create`

**Request Body:**
```json
{
  "customerId": "mongodbObjectId",
  "cartItemIds": ["cartItemId1", "cartItemId2"],
  "shippingAdd1": "123 Main Street",
  "shippingAdd2": "Apartment 4B",
  "city": "New York",
  "zip": "10001",
  "country": "USA",
  "phone": "555-1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully from cart",
  "order": {
    "_id": "orderId",
    "orderItem": ["orderItemId1", "orderItemId2"],
    "shippingAdd1": "123 Main Street",
    "shippingAdd2": "Apartment 4B",
    "city": "New York",
    "zip": "10001",
    "country": "USA",
    "phone": "555-1234",
    "status": "pending",
    "totalprice": 599.97,
    "customer": "customerId",
    "datecreated": "2024-03-25T10:00:00Z"
  }
}
```

---

### 2. **Get Orders by Customer**
Retrieve all orders placed by a specific customer.

**Endpoint:** `GET /api/v1/orders/customer/:customerId`

**Parameters:**
- `customerId` (path): Customer's MongoDB ObjectId

**Response:**
```json
[
  {
    "_id": "orderId",
    "orderItem": [
      {
        "_id": "orderItemId",
        "quantity": 2,
        "product": { /* product details */ }
      }
    ],
    "status": "pending",
    "totalprice": 199.98,
    "customer": { /* customer details */ },
    "datecreated": "2024-03-25T10:00:00Z"
  }
]
```

---

## Workflow Example

### Scenario: User adds items to cart and creates an order

1. **Add Product to Cart**
   ```
   POST /api/v1/cart/add
   {
     "productId": "prod_123",
     "customerId": "cust_456",
     "quantity": 2
   }
   ```

2. **Add Another Product to Cart**
   ```
   POST /api/v1/cart/add
   {
     "productId": "prod_789",
     "customerId": "cust_456",
     "quantity": 1
   }
   ```

3. **View Cart**
   ```
   GET /api/v1/cart/cust_456
   ```

4. **Create Order from Cart Items**
   ```
   POST /api/v1/orders/from-cart/create
   {
     "customerId": "cust_456",
     "cartItemIds": ["cart_item_1", "cart_item_2"],
     "shippingAdd1": "123 Main St",
     "shippingAdd2": "Suite 100",
     "city": "New York",
     "zip": "10001",
     "country": "USA",
     "phone": "555-0123"
   }
   ```

---

### Scenario: User adds to wishlist and moves to cart later

1. **Add Product to Wishlist**
   ```
   POST /api/v1/wishlist/add
   {
     "productId": "prod_123",
     "customerId": "cust_456"
   }
   ```

2. **View Wishlist**
   ```
   GET /api/v1/wishlist/cust_456
   ```

3. **Move from Wishlist to Cart**
   ```
   POST /api/v1/wishlist/moveToCart/wishlist_item_1
   {
     "customerId": "cust_456",
     "quantity": 1
   }
   ```

---

## Data Models

### Cart Model
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product),
  quantity: Number,
  customer: ObjectId (ref: Customer),
  dateAdded: Date
}
```

### Wishlist Model
```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product),
  customer: ObjectId (ref: Customer),
  dateAdded: Date
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (missing fields)
- `404`: Not Found
- `500`: Server Error

---

## Testing with cURL

**Add to Cart:**
```bash
curl -X POST http://localhost:3000/api/v1/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "customerId": "cust_456",
    "quantity": 2
  }'
```

**Get Cart:**
```bash
curl http://localhost:3000/api/v1/cart/cust_456
```

**Add to Wishlist:**
```bash
curl -X POST http://localhost:3000/api/v1/wishlist/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "customerId": "cust_456"
  }'
```

---

## Features Summary

✅ **Cart Management:**
- Add/update/remove items
- Calculate totals automatically
- Clear entire cart

✅ **Wishlist Management:**
- Save items for later
- Move items to cart
- Dedicated wishlist view

✅ **Order Creation:**
- Create orders from selected cart items
- Support for legacy order creation
- Track order by customer
- Automatic cart clearing after order

✅ **Data Tracking:**
- Track item source (cart/wishlist)
- Order history per customer
- Timestamps for all actions
