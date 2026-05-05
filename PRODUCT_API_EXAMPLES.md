# 🔗 PRODUCT API - REQUEST & RESPONSE EXAMPLES

## 1️⃣ GET ALL PRODUCTS

### Request
```
GET /api/product?page=1&limit=10&family=66abc...&search=rebar
Authorization: (optional)
```

### Response - SUCCESS (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "66abc123def456789ghi012",
      "productName": "Steel Rebar",
      "family": {
        "_id": "66abc111111111111111111",
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
          "minRange": 10,
          "maxRange": 1000,
          "thickness": 12,
          "unitSizes": ["meter", "kg"]
        },
        {
          "_id": "66abc123def456789ghi014",
          "reference": "16MM-20",
          "finishQuality": "A Grade",
          "kgsPerUnit": 1.00,
          "miterPerUnitPrice": 35.00,
          "size1": 1000,
          "size2": 1200,
          "minRange": 10,
          "maxRange": 1000,
          "thickness": 16,
          "unitSizes": ["meter", "kg"]
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
  ]
}
```

---

## 2️⃣ GET SINGLE PRODUCT

### Request
```
GET /api/product/66abc123def456789ghi012
Authorization: (optional)
```

### Response - SUCCESS (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "_id": "66abc123def456789ghi012",
    "productName": "Steel Rebar",
    "family": {
      "_id": "66abc111111111111111111",
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
        "minRange": 10,
        "maxRange": 1000,
        "thickness": 12,
        "unitSizes": ["meter", "kg"]
      },
      {
        "_id": "66abc123def456789ghi014",
        "reference": "16MM-20",
        "finishQuality": "A Grade",
        "kgsPerUnit": 1.00,
        "miterPerUnitPrice": 35.00,
        "size1": 1000,
        "size2": 1200,
        "minRange": 10,
        "maxRange": 1000,
        "thickness": 16,
        "unitSizes": ["meter", "kg"]
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

### Response - ERROR (404)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not found"
}
```

---

## 3️⃣ CALCULATE PRODUCT QUOTE (🆕 NEW)

### Request - BASIC (Minimum)
```
POST /api/product/quote/calculate
Content-Type: application/json

{
  "productId": "66abc123def456789ghi012",
  "featuredId": "66abc123def456789ghi013",
  "quantity": 5
}
```

### Response - SUCCESS (200)
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

### Request - WITH DYNAMIC PARAMETERS
```
POST /api/product/quote/calculate
Content-Type: application/json

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

### Response - SUCCESS (200) WITH ADJUSTMENTS
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

### Response - ERROR (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "productId, featuredId, and quantity are required"
}
```

### Response - ERROR (404)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Product not found"
}
```

---

## 4️⃣ ADD PRODUCT TO CART

### Request - BASIC
```
POST /api/cart/add-cart
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "type": "product",
  "product": {
    "productId": "66abc123def456789ghi012",
    "featuredId": "66abc123def456789ghi013",
    "quantity": 5,
    "totalWeight": 2.75,
    "maxDimensionDetected": 1200,
    "miterPerUnitPrice": 25.50,
    "calculatedPrice": 127.50,
    "shippingPrice": 15.00,
    "shippingMethod": "courier"
  },
  "totalAmount": 127.50
}
```

### Response - SUCCESS (201)
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
      "totalWeight": 2.75,
      "maxDimensionDetected": 1200,
      "miterPerUnitPrice": 25.50,
      "calculatedPrice": 127.50,
      "shippingPrice": 15.00,
      "shippingMethod": "courier"
    },
    "type": "product",
    "totalAmount": 127.50,
    "createdAt": "2026-05-05T10:30:00Z",
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

### Request - WITH DYNAMIC PARAMETERS (Enhanced)
```
POST /api/cart/add-cart
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

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

### Response - SUCCESS (201) - Enhanced
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
    "createdAt": "2026-05-05T10:30:00Z",
    "updatedAt": "2026-05-05T10:30:00Z"
  }
}
```

### Response - ERROR (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Product ID missing"
}
```

### Response - ERROR (401)
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized"
}
```

---

## 5️⃣ GET MY CART

### Request
```
GET /api/cart/my-cart?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response - SUCCESS (200)
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
        "featuredId": "66abc123def456789ghi013",
        "quantity": 5,
        "totalWeight": 2.75,
        "maxDimensionDetected": 1200,
        "miterPerUnitPrice": 25.50,
        "calculatedPrice": 127.50,
        "shippingPrice": 15.00,
        "shippingMethod": "courier"
      },
      "type": "product",
      "totalAmount": 127.50,
      "createdAt": "2026-05-05T10:30:00Z"
    },
    {
      "_id": "66abc124rst456def789ghi",
      "userId": "66xyz111111111111111111",
      "serviceData": {
        "serviceType": "rebar",
        "shapeName": "U-Shape",
        "material": "Steel",
        "diameter": 12,
        "units": 5,
        "totalLength": 500,
        "totalWeight": 5.00,
        "productPrice": 200.00,
        "pricePerUnit": 40.00,
        "shippingPrice": 15.00,
        "shippingMethod": "courier"
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

### Response - ERROR (401)
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized"
}
```

---

## 6️⃣ CHECKOUT (🆕 NEW)

### Request
```
POST /api/cart/checkout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

(No body required - uses existing cart items)
```

### Response - SUCCESS (200)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Checkout calculated successfully",
  "data": {
    "subtotal": 327.50,
    "shippingCost": 15.00,
    "totalAmount": 342.50,
    "shippingMethod": "courier",
    "breakdown": {
      "products": [
        {
          "name": "Steel Rebar",
          "quantity": 5,
          "price": 127.50
        }
      ],
      "services": [
        {
          "name": "Rebar Bending",
          "quantity": 1,
          "price": 200.00
        }
      ]
    }
  }
}
```

### Response - ERROR (401)
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized"
}
```

### Response - ERROR (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Cart is empty"
}
```

---

## 7️⃣ CREATE ORDER

### Request - Basic
```
POST /api/order/create-order
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "type": "cart",
  "totalAmount": 342.50,
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

### Response - SUCCESS (201)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "66abc125order789xyz",
    "user": {
      "_id": "66xyz111111111111111111",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "type": "cart",
    "cartItems": [
      {
        "cartId": "66abc124xyz789abc123def",
        "type": "product",
        "productInfo": {
          "productId": "66abc123def456789ghi012",
          "productName": "Steel Rebar",
          "reference": "12MM-20",
          "quantity": 5,
          "calculatedPrice": 127.50
        }
      },
      {
        "cartId": "66abc124rst456def789ghi",
        "type": "service",
        "serviceInfo": {
          "serviceType": "rebar",
          "shapeName": "U-Shape",
          "quantity": 1,
          "productPrice": 200.00
        }
      }
    ],
    "subtotal": 327.50,
    "shippingCost": 15.00,
    "totalAmount": 342.50,
    "status": "pending",
    "paymentStatus": "unpaid",
    "createdAt": "2026-05-05T10:35:00Z",
    "updatedAt": "2026-05-05T10:35:00Z"
  }
}
```

### Response - ERROR FRAUD DETECTED (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Order total mismatch. Expected €342.50, received €372.50. This may indicate a double-shipping error."
}
```

### Response - ERROR (401)
```json
{
  "statusCode": 401,
  "success": false,
  "message": "Unauthorized"
}
```

### Response - ERROR (400)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "totalAmount is required"
}
```

---

## 🔍 COMPARISON TABLE

| Endpoint | Method | Auth | Body | Response |
|----------|--------|------|------|----------|
| `/api/product` | GET | ❌ | Query params | List of products |
| `/api/product/:id` | GET | ❌ | - | Single product |
| `/api/product/quote/calculate` | POST | ❌ | productId, featuredId, quantity, (dynamic params) | Quote with pricing |
| `/api/cart/add-cart` | POST | ✅ | type, product/serviceData, totalAmount | Cart item created |
| `/api/cart/my-cart` | GET | ✅ | Query params | Cart items list |
| `/api/cart/checkout` | POST | ✅ | (none) | Final total with shipping |
| `/api/order/create-order` | POST | ✅ | type, totalAmount, cartItems | Order created |

---

## 💡 FRONTEND WORKFLOW EXAMPLE

### Step 1: Get Product
```javascript
const product = await fetch('/api/product/66abc123def456789ghi012')
  .then(r => r.json())
// Shows all features with sizes, thickness, prices
```

### Step 2: Request Quote (with dynamic params)
```javascript
const quote = await fetch('/api/product/quote/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: '66abc123def456789ghi012',
    featuredId: '66abc123def456789ghi013',
    quantity: 5,
    thickness: 16,
    finishQualitySelected: 'A Grade',
    customPrice: 35.50
  })
}).then(r => r.json())
// Returns: quote.data.pricing.finalQuote = 183.35
```

### Step 3: Add to Cart
```javascript
const cartItem = await fetch('/api/cart/add-cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'product',
    product: {
      productId: '66abc123def456789ghi012',
      featuredId: '66abc123def456789ghi013',
      quantity: 5,
      thickness: 16,
      finishQualitySelected: 'A Grade',
      customPrice: 35.50,
      // From quote response:
      totalWeight: quote.data.summary.totalWeight,
      maxDimensionDetected: quote.data.summary.maxDimension,
      basePrice: quote.data.pricing.basePrice,
      miterPerUnitPrice: quote.data.pricing.miterPerUnitPrice,
      calculatedPrice: quote.data.pricing.productPrice,
      priceAdjustments: quote.data.pricing.priceAdjustments,
      shippingPrice: quote.data.pricing.shippingPrice,
      shippingMethod: quote.data.shippingStatus.method
    },
    totalAmount: quote.data.pricing.finalQuote
  })
}).then(r => r.json())
```

### Step 4: Checkout
```javascript
const checkout = await fetch('/api/cart/checkout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json())
// Returns: checkout.data.totalAmount = 342.50 (with shipping)
```

### Step 5: Create Order
```javascript
const order = await fetch('/api/order/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'cart',
    totalAmount: checkout.data.totalAmount,  // MUST match checkout!
    cartItems: [
      { cartId: '66abc124xyz789abc123def' }
    ]
  })
}).then(r => r.json())
// Creates order if totalAmount matches checkout
```

---

## ⚠️ IMPORTANT POINTS

✅ **Quote calculates price ONLY** (product price, not shipping)
✅ **Checkout adds shipping ONCE** (not per-item)
✅ **Order validates totalAmount** (must match checkout)
✅ **All dynamic parameters stored** (for audit trail)
✅ **Server-side validation** (prevents fraud)
