# API Testing Guide - Client Meeting

## Quick Test Flow

### 1. User Signup & Verification

```bash
# Step 1: Register new user
POST http://localhost:5000/api/v1/user/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Account created successfully. Please verify your email.",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "_id": "user_id",
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com"
    }
  }
}

# ✅ At this point: Email should arrive with verification code


# Step 2: Verify email with OTP
POST http://localhost:5000/api/v1/user/verify-email
Content-Type: application/json
Authorization: Bearer <accessToken from step 1>

{
  "otp": "123456"  // From the email
}

Response:
{
  "success": true,
  "message": "Email verified successfully, you can login now",
  "data": {
    "_id": "user_id",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "role": "user",
    "isVerified": true,
    ...
  }
}

# ✅ User can now login
```

---

### 2. Admin Views All Users (including unverified)

```bash
# Login as admin first
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}

Response includes adminToken in accessToken


# Get all users list (with ADMIN token)
GET http://localhost:5000/api/v1/user/all-users
Authorization: Bearer <adminAccessToken>

Response:
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "createdAt": "2025-03-10T..."
    },
    {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "user",
      "isVerified": false,    // <-- NEW: Can see unverified users!
      "createdAt": "2025-03-13T..."
    }
  ]
}

# ✅ Shows all signed-up users
```

---

### 3. Admin Assigns Admin Role to User

```bash
# Assign admin role to Jane Smith
PATCH http://localhost:5000/api/v1/user/:userId/role
Content-Type: application/json
Authorization: Bearer <adminAccessToken>

{
  "role": "admin"
}

Response:
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "...",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "admin",    // <-- Updated!
    "isVerified": false,
    "createdAt": "..."
  }
}

# ✅ Jane Smith is now an admin
```

---

### 4. Customer Purchase & Email Flow

```bash
# Step 1: Customer creates order
POST http://localhost:5000/api/v1/order/create-order
Content-Type: application/json
Authorization: Bearer <customerAccessToken>

{
  "type": "product",
  "product": {
    "productId": "product_id",
    "featuredId": "feature_id",
    "unitSize": 10
  },
  "quantity": 5,
  "totalAmount": 150.00
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "status": "pending",
    "paymentStatus": "unpaid",
    "totalAmount": 150.00
  }
}


# Step 2: Customer initiates payment
POST http://localhost:5000/api/v1/payment/pay
Content-Type: application/json
Authorization: Bearer <customerAccessToken>

{
  "orderId": "order_id",
  "totalAmount": 150.00
}

Response:
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "url": "https://checkout.stripe.com/pay/cs_....."  // Redirect customer here
  }
}

# ✅ Customer completes payment in Stripe


# Step 3 (AUTOMATIC - Cron Job)
# Every 2 minutes, the server checks Stripe for completed payments
# When payment status = "paid":
#   1. Payment marked as "success"
#   2. Order paymentStatus updated to "paid"
#   3. Email sent to CUSTOMER: "Purchase Confirmation ✅"
#   4. Email sent to ADMIN: "New Purchase Paid"

# ✅ CUSTOMER receives: Purchase Confirmation email
# ✅ ADMIN receives: New Purchase Paid email
```

---

### 5. Admin Updates Order Status & Receives Notification

```bash
# Admin marks order as delivered
PUT http://localhost:5000/api/v1/order/update-status/order_id
Content-Type: application/json
Authorization: Bearer <adminAccessToken>

{
  "status": "delivered"
}

Response:
{
  "success": true,
  "message": "Order status updated successfully"
}

# ✅ ADMIN receives email: "Order Completed ✅"
#    (Contains: Order ID, Customer Name, Customer Email, Status)
```

---

## Email Testing Notes

### To See Emails Arrive:

1. Check the email inbox of `ADMIN_EMAIL` (set in .env)
2. Check the email inbox of customer email address

### Email Subjects:

- **Signup**: "Verify your email"
- **Resend OTP**: "Verify your email"
- **Forgot Password**: "Reset your password"
- **Customer Purchase**: "Purchase Confirmation ✅"
- **Admin Payment**: "New Purchase Paid"
- **Admin Order Complete**: "Order Completed ✅"

### If Emails Don't Arrive:

1. Check `.env` has correct:
   - `EMAIL_ADDRESS` (Gmail account)
   - `EMAIL_PASSWORD` (Gmail App Password, not regular password!)
   - `ADMIN_EMAIL` (Admin email for notifications)

2. If no payment email after 2+ minutes:
   - Payment might still be "pending" in Stripe
   - Cron job runs every 2 minutes
   - Check server logs: `✅ Stripe pending payments check...`

---

## Security Test

```bash
# Try to access admin endpoints WITHOUT admin token
GET http://localhost:5000/api/v1/user/all-users
# (No authorization header)

Response:
{
  "success": false,
  "message": "You are not authorized",
  "statusCode": 401
}

# ✅ Routes are protected!
```

---

## Current Status

✅ All 4 client requirements implemented:

1. Signup mail with verification code handling
2. Purchase confirmation for customer
3. Purchase notification for admin
4. User administration panel with role assignment

Ready for production deployment! 🚀
