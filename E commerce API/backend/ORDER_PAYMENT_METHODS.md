# Order Payment Methods Implementation Guide

## 📋 Overview

The order system now supports **5 payment methods**:

1. **COD** (Cash on Delivery)
2. **Card** (Credit/Debit Card)
3. **UPI** (Unified Payment Interface)
4. **NetBanking** (Net Banking)
5. **EMI** (Equated Monthly Installments)

---

## 🔧 How It Works

### When Creating an Order

You must specify the `paymentMethod` field with one of these values:

| Value | Description | Valid Values |
|-------|-------------|--------------|
| `cod` | Cash on Delivery | ✅ |
| `card` | Credit/Debit Card | ✅ |
| `upi` | UPI Payment | ✅ |
| `netbanking` | Net Banking | ✅ |
| `emi` | EMI Option | ✅ |

---

## 📝 API Examples

### Method 1: Create Order from Cart (Recommended)

**Endpoint:** `POST /api/v1/orders/from-cart/create`

**Required Fields:**
- `customerId` - Customer MongoDB ID
- `shippingAdd1` - First shipping address line
- `shippingAdd2` - Second shipping address line
- `city` - City name
- `zip` - Postal code
- `country` - Country name
- `phone` - Contact phone number
- `cartItemIds` - Array of cart item IDs
- `paymentMethod` - One of: `cod`, `card`, `upi`, `netbanking`, `emi`

#### Example 1: Cash on Delivery

```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "123 Main Street",
  "shippingAdd2": "Apt 4B",
  "city": "New York",
  "zip": "10001",
  "country": "USA",
  "phone": "+1-555-0123",
  "cartItemIds": [
    "64a1b2c3d4e5f6g7h8i9j0k2",
    "64a1b2c3d4e5f6g7h8i9j0k3"
  ],
  "paymentMethod": "cod"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully from cart",
  "order": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
    "customer": "64a1b2c3d4e5f6g7h8i9j0k1",
    "paymentMethod": "cod",
    "totalprice": 299.99,
    "status": "pending",
    "shippingAdd1": "123 Main Street",
    "shippingAdd2": "Apt 4B",
    "city": "New York",
    "zip": "10001",
    "country": "USA",
    "phone": "+1-555-0123",
    "datecreated": "2026-04-06T10:30:00Z",
    "orderItem": [...]
  }
}
```

#### Example 2: Credit Card

```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "456 Oak Avenue",
  "shippingAdd2": "Suite 200",
  "city": "Los Angeles",
  "zip": "90001",
  "country": "USA",
  "phone": "+1-555-0456",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "card"
}
```

**Note:** With card payment, you'll follow up with a separate payment API call to submit card details.

#### Example 3: UPI Payment

```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "789 Park Road",
  "shippingAdd2": "Building A",
  "city": "Mumbai",
  "zip": "400001",
  "country": "India",
  "phone": "+91-9876543210",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "upi"
}
```

#### Example 4: Net Banking

```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "321 Bank Street",
  "shippingAdd2": "Floor 3",
  "city": "Delhi",
  "zip": "110001",
  "country": "India",
  "phone": "+91-9876543210",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "netbanking"
}
```

#### Example 5: EMI Payment

```json
{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "555 EMI Lane",
  "shippingAdd2": "Apt 101",
  "city": "Bangalore",
  "zip": "560001",
  "country": "India",
  "phone": "+91-9876543210",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "emi"
}
```

---

### Method 2: Create Order (Legacy)

**Endpoint:** `POST /api/v1/orders/`

**Required Fields:**
- `orderItems` - Array of items with `product` and `quantity`
- `shippingAdd1`, `shippingAdd2`, `city`, `zip`, `country`, `phone`
- `status` - Order status (e.g., "pending")
- `totalprice` - Total order price
- `customer` - Customer ID
- `paymentMethod` - Payment method

```json
{
  "orderItems": [
    {
      "product": "64a1b2c3d4e5f6g7h8i9j0k5",
      "quantity": 2
    }
  ],
  "shippingAdd1": "100 Commerce Street",
  "shippingAdd2": "Zone A",
  "city": "Chennai",
  "zip": "600001",
  "country": "India",
  "phone": "+91-9876543210",
  "status": "pending",
  "totalprice": 199.99,
  "customer": "64a1b2c3d4e5f6g7h8i9j0k1",
  "paymentMethod": "netbanking"
}
```

---

## 🔗 Checkout Flow Diagram

```
User Selects Items
    ↓
Add to Cart
    ↓
Proceed to Checkout
    ↓
Select Shipping Address
    ↓
SELECT PAYMENT METHOD ← (New Step)
    ├─ Cash on Delivery (COD)
    ├─ Credit/Debit Card
    ├─ UPI
    ├─ Net Banking
    └─ EMI
    ↓
Create Order with Payment Method
    ↓
[If Card Payment]
→ Submit Card Details to Payment API
→ Card details are encrypted
→ Payment is created and processed
    ↓
Order Confirmed
```

---

## 💳 Next Steps for Card/Online Payments

After creating an order with `paymentMethod: "card"`, `"upi"`, `"netbanking"`, or `"emi"`:

1. **Redirect to Payment Gateway** (Stripe, PayPal, RazorPay, etc.)
2. **Submit Card Details** (for card payments only):
   ```
   POST /api/v1/payments/
   {
     "customer": "order.customer",
     "order": "order._id",
     "paymentMethod": "creditCard",
     "amount": "order.totalprice",
     "cardDetails": {
       "cardHolderName": "John Doe",
       "cardNumber": "4532015112830366",
       "expiryMonth": "12",
       "expiryYear": "2025",
       "cvv": "123"
     }
   }
   ```
3. **Process Payment**:
   ```
   POST /api/v1/payments/:paymentId/process
   {
     "status": "completed",
     "transactionId": "TXN-12345"
   }
   ```
4. **Payment Confirmation** → Order status updated to "confirmed"

---

## ✅ Validation Rules

### Payment Method Validation

- ✅ `paymentMethod` is **required** in order creation
- ✅ Must be one of: `cod`, `card`, `upi`, `netbanking`, `emi`
- ❌ Invalid values will return: `400 Bad Request`

### Example Error Response

```json
{
  "success": false,
  "message": "Invalid payment method. Must be one of: cod, card, upi, netbanking, emi"
}
```

---

## 📊 Order Model Updated

The Order schema now includes:

```javascript
{
  orderItem: [...],
  shippingAdd1: String,
  shippingAdd2: String,
  city: String,
  zip: String,
  country: String,
  phone: String,
  status: String,
  totalprice: Number,
  customer: ObjectId,
  paymentMethod: {
    type: String,
    enum: ['cod', 'card', 'upi', 'netbanking', 'emi'],
    required: true
  },
  datecreated: Date
}
```

---

## 🧪 Testing the Payment Methods

### Using REST Client (VS Code)

Add this to `order-api.rest`:

```
### Create Order with COD
POST http://localhost:8080/api/v1/orders/from-cart/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "123 Main Street",
  "shippingAdd2": "Apt 4B",
  "city": "New York",
  "zip": "10001",
  "country": "USA",
  "phone": "+1-555-0123",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "cod"
}

### Create Order with Card
POST http://localhost:8080/api/v1/orders/from-cart/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "shippingAdd1": "456 Oak Avenue",
  "shippingAdd2": "Suite 200",
  "city": "Los Angeles",
  "zip": "90001",
  "country": "USA",
  "phone": "+1-555-0456",
  "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
  "paymentMethod": "card"
}
```

### Using cURL

```bash
# COD Payment
curl --request POST \
  --url http://localhost:8080/api/v1/orders/from-cart/create \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "shippingAdd1": "123 Main Street",
    "shippingAdd2": "Apt 4B",
    "city": "New York",
    "zip": "10001",
    "country": "USA",
    "phone": "+1-555-0123",
    "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
    "paymentMethod": "cod"
  }'

# Card Payment
curl --request POST \
  --url http://localhost:8080/api/v1/orders/from-cart/create \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "customerId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "shippingAdd1": "456 Oak Avenue",
    "shippingAdd2": "Suite 200",
    "city": "Los Angeles",
    "zip": "90001",
    "country": "USA",
    "phone": "+1-555-0456",
    "cartItemIds": ["64a1b2c3d4e5f6g7h8i9j0k2"],
    "paymentMethod": "card"
  }'
```

---

## 📝 Implementation Checklist

- ✅ Order model updated with `paymentMethod` field
- ✅ Order service validates payment method
- ✅ Cart-based order creation accepts payment method
- ✅ Legacy order creation accepts payment method
- ✅ API endpoints require payment method
- ✅ Validation rules enforce valid payment methods
- ⏳ Next: Integrate with external payment gateways (Stripe, RazorPay, PayPal)
- ⏳ Next: Create payment method selection UI component
- ⏳ Next: Implement payment processing logic per gateway

---

## 🔒 Security Notes

- Card details are **encrypted** (AES-256-GCM) when stored
- Payment methods stored as enum to ensure data integrity
- PCI DSS compliance required for production card handling
- Use HTTPS for all payment-related endpoints
- Never log card details or sensitive payment information

---

## 📞 Support

For issues or questions about payment methods:
1. Check order validation error messages
2. Verify cart items exist in database
3. Ensure customer and order IDs are valid
4. Confirm payment method is one of 5 valid options
