# CarCraft Database Design & Schema Documentation

## 1. Overview
The database for **CarCraft: Automotive Inventory & Dealership Suite** is modeled as a normalized relational schema on **PostgreSQL** managed through **Prisma ORM**. It enforces strict referential integrity, foreign key constraints, cascading deletes where appropriate, and indexed lookup fields for multi-role platform operations.

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ DEALERSHIP : "assigned dealer"
    DEALERSHIP ||--o{ USER : "staff members"
    DEALERSHIP ||--o{ VEHICLE : "houses"
    DEALERSHIP ||--o{ SERVICE_APPOINTMENT : "servicing bay"
    DEALERSHIP ||--o{ SERVICE_SLOT : "operates"

    VEHICLE ||--o{ VEHICLE_IMAGE : "displays"
    VEHICLE ||--o{ VEHICLE_INQUIRY : "receives"
    VEHICLE ||--o{ WISHLIST_ITEM : "bookmarked in"

    USER ||--o{ WISHLIST_ITEM : "saves"
    USER ||--o{ VEHICLE_INQUIRY : "submits"
    USER ||--o| CART : "owns"
    CART ||--o{ CART_ITEM : "contains"
    PRODUCT ||--o{ CART_ITEM : "selected as"

    PRODUCT_CATEGORY ||--o{ PRODUCT : "classifies"
    PRODUCT ||--o{ PRODUCT_IMAGE : "shows"

    USER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "includes"
    PRODUCT ||--o{ ORDER_ITEM : "snapshot of"
    ORDER ||--|| PAYMENT : "settled via"

    SERVICE_CATEGORY ||--o{ SERVICE_APPOINTMENT : "service type"
    USER ||--o{ SERVICE_APPOINTMENT : "customer appointments"
    USER ||--o{ SERVICE_APPOINTMENT : "managed by service manager"

    USER ||--o{ REVIEW : "writes"
    USER ||--o{ ACTIVITY_LOG : "triggers"

    USER {
        string id PK
        string name
        string email UK
        string password
        enum role
        string phone
        enum status
        string dealershipId FK
        datetime createdAt
        datetime updatedAt
    }

    DEALERSHIP {
        string id PK
        string name
        string slug UK
        string logo
        string description
        string address
        string city
        string state
        string contactNumber
        string email
        string operatingHours
        string status
        string assignedDealerId FK
        datetime createdAt
        datetime updatedAt
    }

    VEHICLE {
        string id PK
        string dealershipId FK
        string brand
        string model
        string variant
        int year
        float price
        enum fuelType
        enum transmission
        enum bodyType
        int mileage
        int engineCapacity
        int seatingCapacity
        string color
        string description
        string registrationNumber
        enum inventoryStatus
        boolean isFeatured
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT {
        string id PK
        string categoryId FK
        string name
        string slug UK
        string description
        string brand
        string sku UK
        float price
        float discountPrice
        int stockQuantity
        enum status
        boolean isFeatured
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        string id PK
        string orderNumber UK
        string customerId FK
        float subtotal
        float discount
        float shipping
        float total
        enum orderStatus
        enum paymentStatus
        string shippingName
        string shippingAddress
        string city
        string state
        string postalCode
        string phone
        datetime createdAt
        datetime updatedAt
    }

    PAYMENT {
        string id PK
        string orderId FK,UK
        string transactionRef UK
        enum method
        enum status
        float amount
        datetime paidAt
        datetime createdAt
    }

    SERVICE_APPOINTMENT {
        string id PK
        string appointmentNumber UK
        string customerId FK
        string dealershipId FK
        string serviceCategoryId FK
        string vehicleBrand
        string vehicleModel
        string vehicleRegistration
        date preferredDate
        string preferredTimeSlot
        enum status
        string serviceNotes
        string serviceManagerId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 3. Data Dictionary

### A. Core Platform Models
- `User`: Manages credentials, contact information, role (`ADMIN`, `DEALER`, `CUSTOMER`, `SERVICE_MANAGER`), account status (`ACTIVE`, `SUSPENDED`), and optional dealership association.
- `Dealership`: Multi-location dealership profile with city, state, operating hours, and foreign key reference to assigned dealer.
- `ActivityLog`: Immutable security log capturing actors, actions, affected entity IDs, metadata payloads, and timestamps.

### B. Vehicle Inventory Models
- `Vehicle`: Comprehensive technical and commercial attributes for vehicles including brand, model, variant, year, price, fuel type, transmission, body type, mileage, engine capacity, seating, color, registration number, and inventory status (`AVAILABLE`, `RESERVED`, `SOLD`, `MAINTENANCE`).
- `VehicleImage`: One-to-many image URLs per vehicle with primary cover flag.
- `VehicleInquiry`: Inbound test drive and purchase leads submitted by customers or guests with notes and status tracking.
- `WishlistItem`: Composite unique link (`[customerId, vehicleId]`) for saved user favorites.

### C. E-Commerce Models
- `ProductCategory`: Automotive categories (`Car Accessories`, `Interior`, `Exterior`, `Electronics`, `Cleaning`, `Safety`, `Spare Parts`, `Performance`).
- `Product`: Accessories and parts catalog with SKU, brand, price, discount price, stock quantity, and availability status.
- `Cart` & `CartItem`: Persistent server shopping cart for authenticated users.
- `Order` & `OrderItem`: Order records with line-item price freeze preserving historical unit price upon purchase.
- `Payment`: Transaction reference, payment method (`UPI`, `CARD`, `COD`), simulated gateway status, and timestamp.

### D. Service Scheduling Models
- `ServiceCategory`: Catalog of service packages with baseline pricing and standard duration minutes.
- `ServiceSlot`: Configurable bay capacity per weekday and time-slot at each dealership.
- `ServiceAppointment`: Booking entity capturing vehicle details, date, time slot, appointment reference number, workshop status, and service manager technician notes.
