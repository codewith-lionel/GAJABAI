# API Testing Guide

This document provides examples for testing the GAJABAI API endpoints using cURL or Postman.

## Setup

1. Start MongoDB
2. Start backend server: `cd backend && npm run dev`
3. Backend should be running on `http://localhost:5000`

## Authentication

### Register a New User

**Admin User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Seller User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Seller",
    "email": "seller@example.com",
    "password": "seller123",
    "role": "seller"
  }'
```

**Buyer User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Buyer",
    "email": "buyer@example.com",
    "password": "buyer123",
    "role": "buyer"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Save the token for subsequent requests!**

## Admin Endpoints

### Create Category

```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and gadgets"
  }'
```

### Get All Categories

```bash
curl -X GET http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Bargain Analytics

```bash
curl -X GET http://localhost:5000/api/admin/bargains/analytics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Seller Endpoints

### Create Product

```bash
curl -X POST http://localhost:5000/api/seller/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -d '{
    "name": "iPhone 14 Pro",
    "description": "Latest iPhone with amazing features",
    "category": "CATEGORY_ID",
    "images": ["https://example.com/image1.jpg"],
    "adminMinPrice": 80000,
    "adminMaxPrice": 120000,
    "displayPrice": 110000,
    "sellerMinPrice": 95000,
    "stock": 10,
    "bargainingEnabled": true
  }'
```

### Get Seller Products

```bash
curl -X GET http://localhost:5000/api/seller/products \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

### Get Bargain Requests

```bash
curl -X GET http://localhost:5000/api/seller/bargains \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

### Accept Bargain

```bash
curl -X PUT http://localhost:5000/api/seller/bargains/BARGAIN_ID/accept \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

### Reject Bargain

```bash
curl -X PUT http://localhost:5000/api/seller/bargains/BARGAIN_ID/reject \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN"
```

### Counter Bargain

```bash
curl -X PUT http://localhost:5000/api/seller/bargains/BARGAIN_ID/counter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -d '{
    "counterOffer": 100000
  }'
```

## Buyer Endpoints

### Get All Products

```bash
curl -X GET http://localhost:5000/api/products
```

### Get Single Product

```bash
curl -X GET http://localhost:5000/api/products/PRODUCT_ID
```

### Create Bargain (Make Offer)

```bash
curl -X POST http://localhost:5000/api/bargains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "offerAmount": 90000
  }'
```

### Get My Bargains

```bash
curl -X GET http://localhost:5000/api/bargains/my-bargains \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN"
```

### Counter Seller Offer

```bash
curl -X PUT http://localhost:5000/api/bargains/BARGAIN_ID/counter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "counterOffer": 95000
  }'
```

### Create Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "bargainId": "BARGAIN_ID",
    "quantity": 1
  }'
```

## Testing Workflow

### Complete Bargaining Flow

1. **Admin**: Create category
2. **Admin**: Get category ID
3. **Seller**: Create product with the category ID
4. **Buyer**: Browse products
5. **Buyer**: Make an offer on a product
6. **Seller**: View bargain requests
7. **Seller**: Accept/Reject/Counter the offer
8. **Buyer**: If countered, counter again or accept
9. **Buyer**: Create order once bargain is accepted

### Testing Edge Cases

**Test 1: Buyer offers below minimum price**
```bash
# Should fail with error
curl -X POST http://localhost:5000/api/bargains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "offerAmount": 50000
  }'
```

**Test 2: Buyer offers above display price**
```bash
# Should fail with error
curl -X POST http://localhost:5000/api/bargains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "offerAmount": 150000
  }'
```

**Test 3: Seller sets price outside admin limits**
```bash
# Should fail with validation error
curl -X POST http://localhost:5000/api/seller/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test",
    "category": "CATEGORY_ID",
    "adminMinPrice": 80000,
    "adminMaxPrice": 120000,
    "displayPrice": 130000,
    "sellerMinPrice": 95000,
    "stock": 10
  }'
```

**Test 4: Auto-accept when offer meets seller minimum**
```bash
# If seller minimum is 95000, offering 95000 or more should auto-accept
curl -X POST http://localhost:5000/api/bargains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BUYER_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "offerAmount": 95000
  }'
```

## Postman Collection

Import these endpoints into Postman:
1. Create a new collection "GAJABAI API"
2. Add environment variable `baseUrl` = `http://localhost:5000/api`
3. Add environment variable `token` for storing auth token
4. Copy the endpoints above into Postman requests
5. Use `{{baseUrl}}` and `{{token}}` in requests

## Expected Responses

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Notes

- Replace `YOUR_ADMIN_TOKEN`, `YOUR_SELLER_TOKEN`, `YOUR_BUYER_TOKEN` with actual tokens
- Replace `PRODUCT_ID`, `CATEGORY_ID`, `BARGAIN_ID` with actual IDs
- All timestamps are in ISO 8601 format
- Prices are in currency units (e.g., Indian Rupees)
