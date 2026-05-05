# 📤 FRONTEND REQUEST BODIES & RESPONSES (Quick Reference)

## 1️⃣ QUOTE CALCULATION

### 📤 Frontend Send (Minimum)
```json
{
  "productId": "66abc123def456789ghi012",
  "featuredId": "66abc123def456789ghi013",
  "quantity": 5
}
```

### 📥 Backend Response
```json
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
      "maxDimension": 1200,
      "dynamicParameters": {
        "size": null,
        "unitSize": null,
        "range": null,
        "thickness": null,
        "finishQualitySelected": null
      }
    },
    "pricing": {
      "basePrice": 25.50,
      "adjustedPrice": 25.50,
      "priceAdjustments": {
        "basePrice": 25.50,
        "factors": []
      },
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

## 2️⃣ QUOTE WITH DYNAMIC PRICING

### 📤 Frontend Send (With All Dynamic Parameters)
```json
{
  "productId": "66abc123def456789ghi012",
  "featuredId": "66abc123def456789ghi013",
  "quantity": 5,
  "size": 1200,
  "unitSize": "meter",
  "range": 1000,
  "thickness": 16,
  "finishQualitySelected": "A Grade",
  "customPrice": 35.50
}
```

### 📥 Backend Response
```json
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
      "maxDimension": 1200,
      "dynamicParameters": {
        "size": 1200,
        "unitSize": "meter",
        "range": 1000,
        "thickness": 16,
        "finishQualitySelected": "A Grade"
      }
    },
    "pricing": {
      "basePrice": 25.50,
      "adjustedPrice": 36.67,
      "priceAdjustments": {
        "basePrice": 25.50,
        "factors": [
          {
            "type": "frontend_calculated",
            "description": "Price calculated by frontend with dynamic factors",
            "value": 35.50,
            "adjustment": 10.00
          },
          {
            "type": "thickness_adjustment",
            "baseThickness": 12,
            "selectedThickness": 16,
            "adjustment": 1.17
          }
        ]
      },
      "miterPerUnitPrice": 36.67,
      "productPrice": 183.35,
      "shippingPrice": 15.00,
      "finalQuote": 183.35,
      "finalQuoteWithShipping": 198.35
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

## 3️⃣ ADD TO CART

### 📤 Frontend Send (Use data from Quote Response)
```json
{
  "type": "product",
  "product": {
    "productId": "66abc123def456789ghi012",
    "featuredId": "66abc123def456789ghi013",
    "quantity": 5,
    "size": 1200,
    "unitSize": "meter",
    "range": 1000,
    "thickness": 16,
    "finishQualitySelected": "A Grade",
    "customPrice": 35.50,
    "totalWeight": 2.75,
    "maxDimensionDetected": 1200,
    "basePrice": 25.50,
    "miterPerUnitPrice": 36.67,
    "calculatedPrice": 183.35,
    "priceAdjustments": {
      "basePrice": 25.50,
      "factors": [
        {
          "type": "frontend_calculated",
          "description": "Price calculated by frontend with dynamic factors",
          "value": 35.50,
          "adjustment": 10.00
        },
        {
          "type": "thickness_adjustment",
          "baseThickness": 12,
          "selectedThickness": 16,
          "adjustment": 1.17
        }
      ]
    },
    "shippingPrice": 15.00,
    "shippingMethod": "courier"
  },
  "totalAmount": 183.35
}
```

### 📥 Backend Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product added to cart successfully",
  "data": {
    "_id": "66abc124xyz789abc123def",
    "userId": "66xyz111111111111111111",
    "product": {
      "productId": "66abc123def456789ghi012",
      "featuredId": "66abc123def456789ghi013",
      "quantity": 5,
      "size": 1200,
      "unitSize": "meter",
      "range": 1000,
      "thickness": 16,
      "finishQualitySelected": "A Grade",
      "customPrice": 35.50,
      "totalWeight": 2.75,
      "maxDimensionDetected": 1200,
      "basePrice": 25.50,
      "miterPerUnitPrice": 36.67,
      "calculatedPrice": 183.35,
      "priceAdjustments": {
        "basePrice": 25.50,
        "factors": [...]
      },
      "shippingPrice": 15.00,
      "shippingMethod": "courier"
    },
    "type": "product",
    "totalAmount": 183.35,
    "createdAt": "2026-05-05T10:30:00Z"
  }
}
```

---

## 4️⃣ GET CART

### 📤 Frontend Send
```
GET /api/cart/my-cart?page=1&limit=10
Authorization: Bearer TOKEN
```

### 📥 Backend Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart fetched successfully",
  "data": [
    {
      "_id": "66abc124xyz789abc123def",
      "userId": "66xyz111111111111111111",
      "product": {
        "productId": "66abc123def456789ghi012",
        "quantity": 5,
        "calculatedPrice": 183.35
      },
      "type": "product",
      "totalAmount": 183.35,
      "createdAt": "2026-05-05T10:30:00Z"
    },
    {
      "_id": "66abc124rst456def789ghi",
      "userId": "66xyz111111111111111111",
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

## 5️⃣ CHECKOUT

### 📤 Frontend Send
```json
{
}
```
*(No body needed - uses existing cart)*

### 📥 Backend Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Checkout calculated successfully",
  "data": {
    "subtotal": 383.35,
    "shippingCost": 15.00,
    "totalAmount": 398.35,
    "shippingMethod": "courier"
  }
}
```

---

## 6️⃣ CREATE ORDER

### 📤 Frontend Send (Use totalAmount from Checkout)
```json
{
  "type": "cart",
  "totalAmount": 398.35,
  "cartItems": [
    {
      "cartId": "66abc124xyz789abc123def"
    },
    {
      "cartId": "66abc124rst456def789ghi"
    }
  ]
}
```

### 📥 Backend Response - SUCCESS
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "66abc125order789xyz",
    "user": {
      "_id": "66xyz111111111111111111",
      "email": "user@example.com"
    },
    "type": "cart",
    "cartItems": [
      {
        "cartId": "66abc124xyz789abc123def",
        "type": "product",
        "productInfo": {
          "productId": "66abc123def456789ghi012",
          "productName": "Steel Rebar",
          "quantity": 5,
          "calculatedPrice": 183.35
        }
      },
      {
        "cartId": "66abc124rst456def789ghi",
        "type": "service",
        "serviceInfo": {
          "serviceType": "rebar",
          "quantity": 1,
          "productPrice": 200.00
        }
      }
    ],
    "subtotal": 383.35,
    "shippingCost": 15.00,
    "totalAmount": 398.35,
    "status": "pending",
    "paymentStatus": "unpaid",
    "createdAt": "2026-05-05T10:35:00Z"
  }
}
```

### 📥 Backend Response - FRAUD DETECTED
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Order total mismatch. Expected €398.35, received €428.35. This may indicate a double-shipping error."
}
```

---

## 🔄 COMPLETE WORKFLOW

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Quote Product (POST /api/product/quote/calculate)    │
├─────────────────────────────────────────────────────────────┤
│ Send: { productId, featuredId, quantity, dynamic params }    │
│ Get:  { finalQuote: 183.35, totalWeight, maxDimension }     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Add to Cart (POST /api/cart/add-cart)               │
├─────────────────────────────────────────────────────────────┤
│ Send: { type: "product", product: {...all data from quote}, │
│         totalAmount: 183.35 }                               │
│ Get:  { cartId, success }                                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Checkout (POST /api/cart/checkout)                  │
├─────────────────────────────────────────────────────────────┤
│ Send: {} (empty - uses cart items)                          │
│ Get:  { totalAmount: 398.35 (with shipping) }              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Create Order (POST /api/order/create-order)        │
├─────────────────────────────────────────────────────────────┤
│ Send: { type: "cart", totalAmount: 398.35, cartItems }     │
│ Get:  { orderId, success } OR fraud error                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Copy-Paste Headers

### For All Authenticated Endpoints:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### URLs:
```
POST   http://localhost:3000/api/product/quote/calculate
POST   http://localhost:3000/api/cart/add-cart
GET    http://localhost:3000/api/cart/my-cart
POST   http://localhost:3000/api/cart/checkout
POST   http://localhost:3000/api/order/create-order
```

---

## ⚠️ KEY POINTS

✅ **Quote Response** → Use `data.pricing` and `data.summary` in cart request
✅ **Cart Request** → Send ALL fields from quote response + quantity
✅ **Checkout Response** → Use `totalAmount` in order request
✅ **Order Request** → totalAmount MUST match checkout response
✅ **Authentication** → Add `Authorization: Bearer TOKEN` header

---

## 🔍 WHAT EACH ENDPOINT RETURNS

| Endpoint | Returns |
|----------|---------|
| Quote | Price breakdown + weight + shipping method + dimensions |
| Add to Cart | Cart item ID + confirmation |
| Get Cart | List of all items (products + services) |
| Checkout | Subtotal + Shipping + Total (FINAL PRICE) |
| Create Order | Order ID + status (or fraud error) |

✅ **Build Status**: Successful (0 errors)
✅ **Ready for Frontend Integration**
