# CarCraft REST API Specification

This document summarizes the core server route handlers implemented in `app/api/`.

---

## 1. Authentication & Users
- `POST /api/auth/register`
  - Creates a new `CUSTOMER` account with hashed password and associated cart.
  - Body: `{ name, email, phone, password }`
- `PATCH /api/users/[id]`
  - Admin-only endpoint to update user role (`role`) or status (`ACTIVE`, `SUSPENDED`).
  - Guards prevent an administrator from demoting or suspending their own account.

---

## 2. Vehicle Inventory
- `POST /api/vehicles`
  - Adds a new certified vehicle to a showroom.
  - Body: `{ dealershipId, brand, model, variant, year, price, fuelType, transmission, bodyType, mileage, engineCapacity, seatingCapacity, color, registrationNumber, imageUrl, description }`
  - Authorization: `ADMIN` or `DEALER` matching `dealershipId`.
- `PATCH /api/vehicles/[id]`
  - Updates vehicle price, inventory status (`AVAILABLE`, `RESERVED`, `SOLD`, `MAINTENANCE`), or specs.
- `DELETE /api/vehicles/[id]`
  - Deletes vehicle listing with ownership validation.

---

## 3. Vehicle Inquiries & Wishlist
- `POST /api/inquiries`
  - Submits customer lead for a vehicle.
  - Body: `{ vehicleId, name, email, phone, message }`
- `GET /api/wishlist`
  - Returns authenticated customer's saved vehicles.
- `POST /api/wishlist`
  - Adds vehicle to customer wishlist.
  - Body: `{ vehicleId }`
- `DELETE /api/wishlist`
  - Removes vehicle from wishlist.

---

## 4. E-Commerce & Checkout
- `POST /api/orders`
  - Processes simulated checkout, reduces product stock atomically, and creates order and payment records.
  - Body:
    ```json
    {
      "shippingName": "Arjun Verma",
      "shippingAddress": "Flat 402, Sea Breeze Heights",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400018",
      "phone": "+91 98765 43210",
      "paymentMethod": "UPI",
      "simulationOutcome": "SUCCESS",
      "items": [
        { "productId": "<uuid>", "quantity": 1 }
      ]
    }
    ```
- `PATCH /api/orders/[id]`
  - Admin endpoint to transition order status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- `PATCH /api/products/[id]`
  - Admin endpoint to update product price and stock quantity.

---

## 5. Service Appointments
- `POST /api/appointments`
  - Books vehicle service slot.
  - Prevents booking past dates, duplicate slot conflicts, and over-capacity slots.
  - Body:
    ```json
    {
      "dealershipId": "<uuid>",
      "serviceCategoryId": "<uuid>",
      "vehicleBrand": "Tata",
      "vehicleModel": "Harrier",
      "vehicleRegistration": "MH 02 FJ 4812",
      "preferredDate": "2026-11-05",
      "preferredTimeSlot": "10:30 - 12:00",
      "additionalNotes": "Slight brake noise"
    }
    ```
- `PATCH /api/appointments/[id]`
  - Updates status (`CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`) and service notes.
  - Service Manager or Admin can progress job status; Customers can cancel their pending appointment.
