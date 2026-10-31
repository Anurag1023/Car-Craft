# CarCraft: User Roles & Permissions (RBAC)

CarCraft implements four distinct user roles with strict separation of concerns and server-enforced access controls.

---

## 1. ADMIN (`ADMIN`)
- **Scope**: Platform-wide.
- **Capabilities**:
  - View aggregate executive analytics (orders, revenue, appointments, fleet status).
  - Manage all franchise dealerships and assign dealers.
  - Full CRUD operations over all vehicle inventory across any dealership.
  - Manage product catalog, prices, and stock levels.
  - Manage all customer orders and override fulfillment statuses.
  - Oversee all service appointments and bay capacities.
  - Manage user accounts (promote/demote roles, activate/suspend).
  - Inspect platform security and activity logs.
- **Demo Account**: `admin@carcraft.local` / `Password123!`

---

## 2. DEALER (`DEALER`)
- **Scope**: Scoped strictly to assigned dealership (`dealershipId`).
- **Capabilities**:
  - View dealership dashboard metrics (showroom vehicles, available, reserved, sold).
  - Add new vehicles directly to their assigned showroom inventory.
  - Update vehicle details, pricing, and availability status.
  - Delete vehicles with ownership validation.
  - Review incoming customer vehicle inquiries and test drive leads.
  - Monitor service visits scheduled at their showroom.
- **Restrictions**: Cannot view or modify inventory, inquiries, or confidential data belonging to other dealerships.
- **Demo Account**: `dealer@carcraft.local` / `Password123!`

---

## 3. SERVICE MANAGER (`SERVICE_MANAGER`)
- **Scope**: Scoped strictly to assigned dealership service workshop (`dealershipId`).
- **Capabilities**:
  - View real-time workshop bay schedule.
  - Review pending service requests.
  - Accept or reject appointments.
  - Transition job status: `PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`.
  - Add technician workshop notes.
- **Restrictions**: Cannot manage vehicle sales inventory or access other dealerships' service queues.
- **Demo Account**: `service@carcraft.local` / `Password123!`

---

## 4. CUSTOMER (`CUSTOMER`)
- **Scope**: Personal account and public marketplace.
- **Capabilities**:
  - Browse and filter certified vehicles.
  - Compare specifications of up to 3 cars side-by-side.
  - Add vehicles to saved wishlist.
  - Submit test drive and vehicle inquiries to dealerships.
  - Browse accessories catalog, add items to cart, and checkout via simulated mock payment gateway.
  - View order history and delivery receipt.
  - Schedule vehicle service visits and cancel pending bookings.
  - Manage account profile.
- **Demo Account**: `customer@carcraft.local` / `Password123!`
