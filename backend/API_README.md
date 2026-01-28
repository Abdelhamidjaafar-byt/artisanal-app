# Artisan Platform API Documentation

Base URL: `http://localhost:5000/api` (or wherever your backend runs)

## Authentication

### Register
**Endpoint:** `POST /auth/register`
**Content-Type:** `application/json`

**Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "CLIENT" 
}
```
*Note: `role` can be `CLIENT` or `ARTISAN`.*

### Login
**Endpoint:** `POST /auth/login`
**Content-Type:** `application/json`

**Payload:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

---

## Products (Artisan Only)

### Create Product
**Endpoint:** `POST /products`
**Content-Type:** `multipart/form-data`
**Auth Required:** Yes (Token in Header `Authorization: Bearer <token>`)

**Payload (Form Data):**
*   `title`: (Text) Handmade Rug
*   `description`: (Text) A beautiful wool rug.
*   `price`: (Number) 150
*   `stock`: (Number) 10
*   `category`: (Text) Weaving
*   `isCustomizable`: (Boolean) true
*   `productionTime`: (Number) 7
*   `images`: (File) [Select files...] (Up to 5 images)

### Update Product
**Endpoint:** `PUT /products/:id`
**Content-Type:** `multipart/form-data` (if updating images) or `application/json`
**Auth Required:** Yes

**Payload:**
Same fields as Create. You can send new images to append them.

### Delete Product
**Endpoint:** `DELETE /products/:id`
**Auth Required:** Yes

---

## Orders

### Create Order (Client)
**Endpoint:** `POST /orders`
**Content-Type:** `application/json`
**Auth Required:** Yes

**Payload:**
```json
{
  "items": [
    {
      "product": "64b5f9...", // Product ID
      "quantity": 1,
      "customizationDetails": "Red color" 
    }
  ],
  "totalAmount": 150,
  "shippingAddress": "123 Main St, City"
}
```

### Get My Orders
**Endpoint:** `GET /orders/myorders`
**Auth Required:** Yes

### Update Order Status (Artisan/Admin)
**Endpoint:** `PUT /orders/:id/status`
**Content-Type:** `application/json`
**Auth Required:** Yes

**Payload:**
```json
{
  "status": "in_production"
}
```
*Valid Statuses:* `in_cart`, `pending`, `paid`, `in_production`, `completed`, `shipped`, `cancelled`.
