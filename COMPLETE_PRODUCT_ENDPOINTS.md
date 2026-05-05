# 🔗 COMPLETE PRODUCT ENDPOINTS & FLOW

## 📋 All Product Endpoints

### ✅ EXISTING ENDPOINTS (Before Fix)

| # | Endpoint | Method | Auth | Purpose |
|---|----------|--------|------|---------|
| 1 | `/api/product` | GET | ❌ No | Get all products |
| 2 | `/api/product/:id` | GET | ❌ No | Get single product |
| 3 | `/api/product/add-product` | POST | ❌ No | Create product (Admin) |
| 4 | `/api/product/update/:id` | PUT | ❌ No | Update product (Admin) |
| 5 | `/api/product/delete/:id` | DELETE | ❌ No | Delete product (Admin) |
| 6 | `/api/shipping/calculate-product` | POST | ❌ No | Calculate shipping only |
| 7 | `/api/cart/add-cart` | POST | ✅ Auth | Add item to cart |
| 8 | `/api/cart/my-cart` | GET | ✅ Auth | Get my cart |
| 9 | `/api/order/create-order` | POST | ✅ Auth | Create order |

### 🆕 NEW ENDPOINTS (After Fix)

| # | Endpoint | Method | Auth | Purpose |
|---|----------|--------|------|---------|
| 10 | `/api/product/quote/calculate` | POST | ❌ No | **NEW** Get product quote with price + shipping |
| 11 | `/api/cart/checkout` | POST | ✅ Auth | **NEW** Calculate final total with shipping ONCE |

---

## 🔄 COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCT ORDERING FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: Browse Products
├─ GET /api/product                    ← Get all products list
└─ GET /api/product/:id                ← Get product details with features

STEP 2: Get Product Quote (NEW!)
├─ POST /api/product/quote/calculate
│  ├─ Input: productId, featuredId, quantity
│  ├─ Backend: Calculates price + weight + shipping
│  └─ Output: productPrice, shippingPrice, totalWeight
│
└─ Response includes:
   • finalQuote: 127.50 (product price ONLY)
   • shippingPrice: 15.00 (for display)
   • totalWeight: 2.75kg (store in cart)
   • maxDimension: 1200mm (store in cart)

STEP 3: Add Product to Cart
├─ POST /api/cart/add-cart
│  ├─ Input: type="product", product data (with weight/price from step 2)
│  ├─ Backend: Stores product with weight/dimensions
│  └─ Output: Cart item created
│
└─ Cart item includes:
   • productId, featuredId
   • calculatedPrice: 127.50
   • totalWeight: 2.75
   • maxDimensionDetected: 1200

STEP 4: View Cart
├─ GET /api/cart/my-cart
│  ├─ Lists all items (products + services)
│  └─ Shows each item's totalAmount (product price ONLY)
│
└─ No shipping shown here (calculated at checkout)

STEP 5: Checkout (NEW!)
├─ POST /api/cart/checkout
│  ├─ Backend: Aggregates all weights
│  ├─ Backend: Calculates shipping ONCE
│  └─ Output: { subtotal, shippingCost, totalAmount }
│
└─ Returns:
   • subtotal: 127.50 (all products)
   • shippingCost: 15.00 (calculated ONCE)
   • totalAmount: 142.50 (final price)

STEP 6: Create Order
├─ POST /api/order/create-order
│  ├─ Input: totalAmount (from checkout)
│  ├─ Backend: Validates totalAmount matches calculation
│  ├─ Backend: Rejects if mismatch > 5%
│  └─ Output: Order created
│
└─ If fraud detected:
   ❌ Error: "Order total mismatch"
   ✅ Order rejected

STEP 7: Order Complete ✅
```

---

## 📊 DETAILED ENDPOINTS

### 1️⃣ GET ALL PRODUCTS (Existing)

```
GET /api/product?page=1&limit=10&family=FAMILY_ID&search=rebar

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "All Products fetched successfully",
  "data": [
    {
      "_id": "66abc123def456789ghi012",
      "productName": "Steel Rebar",
      "family": "66abc...",
      "features": [
        {
          "_id": "66abc123def456789ghi013",
          "reference": "12MM-20",
          "finishQuality": "A Grade",
          "kgsPerUnit": 0.55,
          "miterPerUnitPrice": 25.50,
          "size1": 1000,
          "size2": 1200,
          "unitSizes": ["meter", "kg"]
        }
      ],
      "measureUnit": "meter",
      "createdAt": "2026-05-05T10:00:00Z"
    }
  ]
}
```

---

### 2️⃣ GET SINGLE PRODUCT (Existing)

```
GET /api/product/66abc123def456789ghi012

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "_id": "66abc123def456789ghi012",
    "productName": "Steel Rebar",
    "family": {
      "_id": "66abc...",
      "familyName": "Structural Steel"
    },
    "features": [
      {
        "_id": "66abc123def456789ghi013",
        "reference": "12MM-20",
        "finishQuality": "A Grade",
        "kgsPerUnit": 0.55,
        "miterPerUnitPrice": 25.50,
        "size1": 1000,
        "size2": 1200,
        "unitSizes": ["meter", "kg"],
        "minRange": 10,
        "maxRange": 1000
      },
      {
        "_id": "66abc123def456789ghi014",
        "reference": "16MM-20",
        "finishQuality": "A Grade",
        "kgsPerUnit": 1.00,
        "miterPerUnitPrice": 35.00,
        "size1": 1000,
        "size2": 1200
      }
    ],
    "measureUnit": "meter",
    "productImage": [
      {
        "url": "https://res.cloudinary.com/...",
        "publickey": "polspoch/product/..."
      }
    ],
    "createdAt": "2026-05-05T10:00:00Z"
  }
}
```

---

### 3️⃣ CALCULATE PRODUCT QUOTE (NEW!)

```
POST /api/product/quote/calculate
Content-Type: application/json

Request:
{
  "productId": "66abc123def456789ghi012",
  "featuredId": "66abc123def456789ghi013",
  "quantity": 5
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Product quote calculated successfully",
  "data": {
    "summary": {
      "productName": "Steel Rebar",
      "reference": "12MM-20",
      "finishQuality": "A Grade",
      "quantity": 5,
      "totalWeight": 2.75,
      "maxDimension": 1200
    },
    "pricing": {
      "miterPerUnitPrice": 25.50,
      "productPrice": 127.50,
      "shippingPrice": 15.00,
      "finalQuote": 127.50,
      "finalQuoteWithShipping": 142.50
    },
    "shippingStatus": {
      "method": "courier",
      "isOversized": false,
      "maxDimensionDetected": 1200
    }
  }
}
```

---

### 4️⃣ ADD PRODUCT TO CART (Existing - But Enhanced)

```
POST /api/cart/add-cart
Content-Type: application/json
Authorization: Bearer TOKEN

Request:
{
  "type": "product",
  "product": {
    "productId": "66abc123def456789ghi012",
    "featuredId": "66abc123def456789ghi013",
    "quantity": 5,
    "totalWeight": 2.75,              ← NEW: From quote
    "maxDimensionDetected": 1200,     ← NEW: From quote
    "miterPerUnitPrice": 25.50,       ← NEW: From quote
    "calculatedPrice": 127.50,        ← NEW: From quote
    "shippingPrice": 15.00,           ← NEW: For display
    "shippingMethod": "courier"       ← NEW: For reference
  },
  "totalAmount": 127.50               ← IMPORTANT: Product price ONLY
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "_id": "66abc124xyz789abc123def",
    "userId": "66xyz...",
    "product": {
      "productId": "66abc123def456789ghi012",
      "featuredId": "66abc123def456789ghi013",
      "quantity": 5,
      "totalWeight": 2.75,
      "maxDimensionDetected": 1200,
      "calculatedPrice": 127.50,
      "shippingPrice": 15.00,
      "shippingMethod": "courier"
    },
    "type": "product",
    "totalAmount": 127.50,
    "createdAt": "2026-05-05T10:30:00Z"
  }
}
```

---

### 5️⃣ GET MY CART (Existing)

```
GET /api/cart/my-cart?page=1&limit=10
Authorization: Bearer TOKEN

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Cart fetched successfully",
  "data": [
    {
      "_id": "66abc124xyz789abc123def",
      "userId": "66xyz...",
      "product": {
        "productId": "66abc123def456789ghi012",
        "quantity": 5,
        "calculatedPrice": 127.50
      },
      "type": "product",
      "totalAmount": 127.50,
      "createdAt": "2026-05-05T10:30:00Z"
    },
    {
      "_id": "66abc124rst456def789ghi",
      "userId": "66xyz...",
      "serviceData": {
        "serviceType": "rebar",
        "totalWeight": 5.00,
        "productPrice": 200.00
      },
      "type": "service",
      "totalAmount": 200.00,
      "createdAt": "2026-05-05T10:25:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

---

### 6️⃣ CHECKOUT (NEW!)

```
POST /api/cart/checkout
Authorization: Bearer TOKEN

Request: (No body needed)

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Checkout calculated successfully",
  "data": {
    "subtotal": 327.50,           ← 127.50 (product) + 200.00 (service)
    "shippingCost": 15.00,        ← Calculated ONCE (not per item!)
    "totalAmount": 342.50,        ← Final price
    "shippingMethod": "courier"
  }
}
```

---

### 7️⃣ CREATE ORDER (Existing - But Enhanced Validation)

```
POST /api/order/create-order
Content-Type: application/json
Authorization: Bearer TOKEN

Request:
{
  "type": "cart",
  "totalAmount": 342.50,            ← MUST match checkout response!
  "cartItems": [
    {
      "cartId": "66abc124xyz789abc123def"
    },
    {
      "cartId": "66abc124rst456def789ghi"
    }
  ]
}

Response (SUCCESS):
{
  "statusCode": 200,
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "66abc125order789xyz",
    "user": "user@example.com",
    "type": "cart",
    "cartItems": [
      {
        "cartId": "66abc124xyz789abc123def",
        "type": "product",
        "productInfo": {
          "productId": "66abc123def456789ghi012",
          "productName": "Steel Rebar",
          "calculatedPrice": 127.50,
          "quantity": 5
        }
      },
      {
        "cartId": "66abc124rst456def789ghi",
        "type": "service",
        "serviceInfo": {
          "serviceType": "rebar",
          "productPrice": 200.00
        }
      }
    ],
    "subtotal": 327.50,
    "shippingCost": 15.00,
    "totalAmount": 342.50,
    "status": "pending",
    "paymentStatus": "unpaid",
    "createdAt": "2026-05-05T10:35:00Z"
  }
}

Response (FRAUD DETECTED):
{
  "statusCode": 400,
  "success": false,
  "message": "Order total mismatch. Expected €342.50, received €372.50. This may indicate a double-shipping error."
}
```

---

### 8️⃣ CALCULATE SHIPPING ONLY (Existing - Rarely Used Now)

```
POST /api/shipping/calculate-product
Content-Type: application/json

Request:
{
  "totalWeight": 2.75,
  "maxDimension": 1200
}

Response:
{
  "success": true,
  "shippingPrice": 15.00,
  "shippingStatus": {
    "method": "courier",
    "isOversized": false,
    "maxDimensionDetected": 1200
  }
}
```

---

## 🎯 ENDPOINT SUMMARY TABLE

| Step | Endpoint | New? | Required Data | Returns |
|------|----------|------|---------------|---------|
| 1 | GET `/api/product` | ❌ | page, limit | Product list |
| 2 | GET `/api/product/:id` | ❌ | Product ID | Product details |
| 3 | POST `/api/product/quote/calculate` | ✅ NEW | productId, featuredId, quantity | Price + shipping + weight |
| 4 | POST `/api/cart/add-cart` | ❌ (Enhanced) | type, product data, totalAmount | Cart item |
| 5 | GET `/api/cart/my-cart` | ❌ | page, limit | All cart items |
| 6 | POST `/api/cart/checkout` | ✅ NEW | (none) | subtotal + shipping + total |
| 7 | POST `/api/order/create-order` | ❌ (Enhanced) | type, totalAmount, cartItems | Order created |
| 8 | POST `/api/shipping/calculate-product` | ❌ | totalWeight, maxDimension | Shipping cost |

---

## ⚠️ IMPORTANT: Order of Operations

```
✅ CORRECT ORDER:

1. GET /api/product/:id              Get product details
2. POST /api/product/quote/calculate Get price + weight
3. POST /api/cart/add-cart           Add to cart with weight
4. POST /api/cart/checkout           Get final total
5. POST /api/order/create-order      Create order with checkout total

❌ WRONG ORDER (causes errors):

1. POST /api/cart/add-cart (without weight) ← Missing data
2. POST /api/order/create-order      ← Will fail validation
```

---

## 🔒 Security: Validation Flow

```
User adds product to cart
        ↓
totalAmount = 127.50 (stored in cart)
        ↓
User adds another product
totalAmount = 90.00 (stored in cart)
        ↓
POST /api/cart/checkout
        ↓
Backend calculates:
  • Product 1: 127.50
  • Product 2: 90.00
  • Subtotal: 217.50
  • Shipping: 15.00 (ONCE!)
  • Expected Total: 232.50
        ↓
POST /api/order/create-order { totalAmount: 232.50 }
        ↓
Backend validation:
  ✅ Matches checkout → Order created!
        ↓
POST /api/order/create-order { totalAmount: 262.50 }
        ↓
Backend validation:
  ❌ Doesn't match → Order REJECTED!
  Message: "Expected €232.50, received €262.50"
```

---

## 📌 Key Differences: Before vs After Fix

| Aspect | Before | After |
|--------|--------|-------|
| **Product Quote** | ❌ Missing | ✅ POST `/api/product/quote/calculate` |
| **Weight Storage** | ❌ Not stored | ✅ Stored in cart |
| **Shipping Calculation** | ❌ Per-item | ✅ Once at checkout |
| **Cart Checkout** | ❌ No endpoint | ✅ POST `/api/cart/checkout` |
| **Order Validation** | ❌ Accepts any amount | ✅ Validates server-side |
| **Double Charge** | ❌ Possible | ✅ Prevented |

---

## ✅ Your Complete Endpoint List

**NEW ENDPOINTS (2):**
1. `POST /api/product/quote/calculate`
2. `POST /api/cart/checkout`

**ENHANCED ENDPOINTS (2):**
1. `POST /api/cart/add-cart` (now accepts weight/price fields)
2. `POST /api/order/create-order` (now validates totals)

**EXISTING ENDPOINTS (6):**
1. `GET /api/product`
2. `GET /api/product/:id`
3. `POST /api/product/add-product`
4. `PUT /api/product/update/:id`
5. `DELETE /api/product/:id`
6. `POST /api/shipping/calculate-product`

**Total: 10 active product-related endpoints**
