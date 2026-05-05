# 🔄 DYNAMIC PRODUCT PRICING SYSTEM

## Overview

Product prices are **NOT static** - they depend on multiple dynamic parameters that the frontend sends. This document explains how the system handles these variations.

---

## 📊 Dynamic Parameters

### 1. **Size** (Optional)
- **Description**: Selected product size/dimension
- **Effect**: Can affect shipping method and cost
- **Sent From**: Frontend (user selection)
- **Impact on Price**: ⚠️ Currently for reference only, can be extended for price adjustments

### 2. **Unit Size** (Optional)
- **Description**: Unit of measurement (meter, kg, piece, etc.)
- **Effect**: Defines how quantity is measured
- **Sent From**: Frontend (user selection)
- **Impact on Price**: ⚠️ For reference, can be extended for different unit pricing

### 3. **Range** (Optional)
- **Description**: Min/Max range selection
- **Fields**: `minRange`, `maxRange` in product features
- **Effect**: Validates if selected size is within acceptable range
- **Sent From**: Frontend (user input)
- **Impact on Price**: ⚠️ Currently triggers warning, can be extended for surcharges

### 4. **Thickness** (Optional)
- **Description**: Product thickness value
- **Fields**: `feature.thickness` in product features
- **Effect**: **DIRECTLY AFFECTS PRICING** 🔴
- **Calculation**: 
  ```
  thicknessRatio = selectedThickness / baseThickness
  priceAdjustment = basePrice * (thicknessRatio - 1) * 0.1
  finalPrice = basePrice + priceAdjustment
  ```
- **Sent From**: Frontend (user selection)
- **Impact on Price**: ✅ 10% adjustment per thickness unit

### 5. **Finish Quality** (Optional)
- **Description**: Product quality grade/finish
- **Examples**: "A Grade", "B Grade", "Standard", "Premium"
- **Effect**: May indicate different pricing
- **Sent From**: Frontend (user selection)
- **Impact on Price**: ⚠️ Currently tracked, can be extended with quality multipliers

### 6. **Custom Price** (Optional)
- **Description**: Pre-calculated price from frontend
- **Effect**: **OVERRIDES BASE CALCULATION** 🔴
- **Use Case**: When frontend has calculated price based on complex factors
- **Sent From**: Frontend calculation
- **Impact on Price**: ✅ Replaces base price entirely if provided

---

## 🧮 Pricing Calculation Flow

```
┌─────────────────────────────────────────────────────────┐
│ POST /api/product/quote/calculate                        │
│ {                                                        │
│   productId: "...",                                      │
│   featuredId: "...",                                     │
│   quantity: 5,                                           │
│   size: 1200,              ← DYNAMIC                     │
│   unitSize: "meter",       ← DYNAMIC                     │
│   range: 1000,             ← DYNAMIC                     │
│   thickness: 16,           ← DYNAMIC (affects price)    │
│   finishQualitySelected: "A Grade",  ← DYNAMIC           │
│   customPrice: 35.50       ← DYNAMIC (overrides base)    │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 1: GET BASE PRICE                                  │
│ basePrice = feature.miterPerUnitPrice = 25.50          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: APPLY CUSTOM PRICE IF PROVIDED                  │
│ if (customPrice && customPrice !== basePrice) {         │
│   basePrice = customPrice = 35.50                       │
│   priceAdjustments.factors.push({                       │
│     type: "frontend_calculated",                        │
│     value: 35.50,                                       │
│     adjustment: 10.00                                   │
│   })                                                    │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: APPLY THICKNESS ADJUSTMENT                      │
│ if (thickness && feature.thickness) {                   │
│   thicknessRatio = 16 / 12 = 1.33                      │
│   adjustment = 35.50 * (1.33 - 1) * 0.1 = 1.17        │
│   basePrice = 35.50 + 1.17 = 36.67                     │
│   priceAdjustments.factors.push({                       │
│     type: "thickness_adjustment",                       │
│     baseThickness: 12,                                  │
│     selectedThickness: 16,                              │
│     adjustment: 1.17                                    │
│   })                                                    │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: CALCULATE FINAL PRICE                           │
│ productPrice = basePrice * quantity                     │
│             = 36.67 * 5 = 183.35                        │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ RESPONSE: Full quote with all adjustments shown         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Request Format

### ✅ REQUIRED Fields
```json
{
  "productId": "66abc123def456789ghi012",
  "featuredId": "66abc123def456789ghi013",
  "quantity": 5
}
```

### ✅ OPTIONAL DYNAMIC Fields
```json
{
  "size": 1200,
  "unitSize": "meter",
  "range": 1000,
  "thickness": 16,
  "finishQualitySelected": "A Grade",
  "customPrice": 35.50
}
```

### 📝 Complete Example
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

---

## 📤 Response Format

### Response Shows All Pricing Factors

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product quote calculated successfully",
  "data": {
    "summary": {
      "productName": "Steel Rebar",
      "reference": "16MM-20",
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
      "basePrice": 25.50,                    ← Original feature price
      "adjustedPrice": 36.67,                ← After all adjustments
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
      "miterPerUnitPrice": 36.67,           ← Adjusted per-unit price
      "productPrice": 183.35,                ← Final product price (36.67 * 5)
      "shippingPrice": 15.00,
      "finalQuote": 183.35,                  ← For order (product only)
      "finalQuoteWithShipping": 198.35       ← For display
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

## 🔄 Cart Storage

When adding to cart, all dynamic parameters are stored:

```json
{
  "type": "product",
  "product": {
    "productId": "66abc123def456789ghi012",
    "featuredId": "66abc123def456789ghi013",
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
    "priceAdjustments": { ... },
    "shippingPrice": 15.00,
    "shippingMethod": "courier"
  },
  "quantity": 1,
  "totalAmount": 183.35
}
```

---

## 🛒 Checkout Calculation

When user proceeds to checkout, the system:

1. ✅ Uses stored `calculatedPrice` for each product
2. ✅ Aggregates all product prices
3. ✅ Calculates shipping ONCE for entire order (not per-item)
4. ✅ Returns final total

```json
POST /api/cart/checkout

Response:
{
  "subtotal": 183.35,      ← All products
  "shippingCost": 15.00,   ← Calculated ONCE
  "totalAmount": 198.35,   ← Final price
  "shippingMethod": "courier"
}
```

---

## ✅ Order Creation

When creating order, the stored `totalAmount` is validated:

```json
POST /api/order/create-order
{
  "type": "cart",
  "totalAmount": 198.35,   ← Must match checkout!
  "cartItems": [...]
}
```

Backend validates:
- ✅ Recalculates all prices
- ✅ Checks if provided totalAmount matches
- ✅ Rejects if mismatch > 5%
- ✅ Prevents fraud/double-charging

---

## 🔍 Price Adjustment Types

### 1. Frontend Calculated
```json
{
  "type": "frontend_calculated",
  "description": "Price calculated by frontend with dynamic factors",
  "value": 35.50,
  "adjustment": 10.00
}
```

### 2. Thickness Adjustment
```json
{
  "type": "thickness_adjustment",
  "baseThickness": 12,
  "selectedThickness": 16,
  "adjustment": 1.17
}
```

### 3. Quality Change Warning
```json
{
  "type": "quality_change",
  "baseQuality": "A Grade",
  "selectedQuality": "B Grade",
  "note": "Quality mismatch - verify pricing with admin"
}
```

### 4. Size Out of Range Warning
```json
{
  "type": "size_out_of_range",
  "size": 5000,
  "minRange": 100,
  "maxRange": 2000,
  "warning": "Size 5000 is outside recommended range (100-2000)"
}
```

---

## 📱 Frontend Integration Guide

### STEP 1: Get Product Details
```javascript
// Get product to see available options
const product = await fetch('/api/product/66abc123def456789ghi012')
// Shows: features with size1, size2, thickness, minRange, maxRange
```

### STEP 2: Frontend Calculates Custom Price (Optional)
```javascript
// If frontend has complex pricing logic:
const customPrice = calculateCustomPrice({
  basePrice: 25.50,
  selectedThickness: 16,
  selectedQuality: "Premium",
  discountCode: "SUMMER20"
})
// customPrice = 35.50
```

### STEP 3: Request Quote with All Parameters
```javascript
const quote = await fetch('/api/product/quote/calculate', {
  method: 'POST',
  body: JSON.stringify({
    productId: '66abc123def456789ghi012',
    featuredId: '66abc123def456789ghi013',
    quantity: 5,
    size: 1200,
    unitSize: 'meter',
    range: 1000,
    thickness: 16,
    finishQualitySelected: 'A Grade',
    customPrice: 35.50  // Include if you calculated it
  })
})
// Returns: Full quote with all adjustments shown
```

### STEP 4: Add to Cart with All Data
```javascript
const cartItem = await fetch('/api/cart/add-cart', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({
    type: 'product',
    product: {
      productId: '66abc123def456789ghi012',
      featuredId: '66abc123def456789ghi013',
      quantity: 5,
      size: 1200,
      unitSize: 'meter',
      range: 1000,
      thickness: 16,
      finishQualitySelected: 'A Grade',
      customPrice: 35.50,
      // From quote response:
      totalWeight: 2.75,
      maxDimensionDetected: 1200,
      basePrice: 25.50,
      miterPerUnitPrice: 36.67,
      calculatedPrice: 183.35,
      priceAdjustments: { ... },
      shippingPrice: 15.00,
      shippingMethod: 'courier'
    },
    totalAmount: 183.35
  })
})
```

---

## ⚠️ Important Notes

1. **Never Trust Frontend Price**: Always recalculate on backend
2. **Store All Parameters**: Keep dynamic parameters for audit trail
3. **Shipping Once**: Shipping calculated ONCE at checkout, not per-item
4. **Validation**: Order validation ensures no double-charging
5. **Price Adjustments Tracked**: All modifications logged for transparency

---

## 🔐 Security Checks

✅ Backend recalculates all prices
✅ Validates final totalAmount before creating order
✅ Rejects orders with > 5% variance from calculated
✅ Prevents fraud through server-side validation
✅ Logs all price adjustments for audit

---

## 📝 Summary

| Parameter | Required | Type | Effect |
|-----------|----------|------|--------|
| productId | ✅ YES | String | Product identification |
| featuredId | ✅ YES | String | Feature selection |
| quantity | ✅ YES | Number | Order quantity |
| size | ❌ NO | Number | Shipping dimension |
| unitSize | ❌ NO | String | Unit of measurement |
| range | ❌ NO | Number | For validation |
| **thickness** | ❌ NO | Number | **Affects price** 🔴 |
| finishQualitySelected | ❌ NO | String | Quality tracking |
| **customPrice** | ❌ NO | Number | **Overrides base** 🔴 |

---

## 🚀 Next Steps

The system is now ready to handle:
- ✅ Multiple dynamic pricing factors
- ✅ Complex pricing logic from frontend
- ✅ Full price transparency
- ✅ Server-side validation
- ✅ Fraud prevention

Contact backend if frontend needs additional pricing factors!
