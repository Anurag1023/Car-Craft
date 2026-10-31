# CarCraft: Automotive Inventory & Dealership Suite

A comprehensive, production-quality full-stack automotive platform combining **multi-dealership vehicle inventory management**, **certified vehicle listings & comparison**, **automotive accessories e-commerce with simulated payments**, **workshop service bay appointment scheduling**, and **role-based analytics dashboards**.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.

---

## 🚀 Key Modules & Capabilities

1. **Public Automotive Marketplace**
   - Modern hero section with brand badges, quick search, and live platform metrics.
   - Dedicated vehicle listings with multi-parameter filtering (brand, fuel type, transmission, body type, price range, year, mileage).
   - Side-by-side vehicle comparison engine (up to 3 cars) highlighting specification differences.
   - Vehicle detail view with multi-image gallery, full specs table, and dealership location card.
   - Public dealership profile directory with showroom inventory and customer reviews.

2. **Vehicle Inventory Management (Admin & Dealer)**
   - Complete CRUD operations with server-side Zod validation.
   - Strict dealership scoping (dealers can only edit or delete vehicles belonging to their assigned showroom).
   - Real-time inventory status management (`AVAILABLE`, `RESERVED`, `SOLD`, `MAINTENANCE`).
   - Customer lead and inquiry management with contact details and message history.

3. **Automotive Accessories E-Commerce**
   - 8 product categories (Accessories, Interior, Exterior, Electronics, Cleaning, Safety, Spare Parts, Performance).
   - Persistent shopping cart with stock limit constraints.
   - Multi-step checkout with simulated Mock Payment Gateway (Simulated UPI, Card, Cash on Delivery).
   - Simulation testing toggles: *Simulate Success (200 OK)*, *Simulate Declined*, *Simulate User Cancel*.
   - Atomic database transactions (`prisma.$transaction`) ensuring guaranteed stock reduction upon confirmation.

4. **Service Appointment Scheduling**
   - Service category catalog (General Servicing, Diagnostics, AC, Detailing, etc.).
   - Smart bay allocation with operating hours validation and duplicate conflict prevention.
   - Customer booking flow and management dashboard with cancellation rules.
   - Service Manager workshop dispatch console: Accept, Reject, Start Service, Add Technician Notes, and Mark Completed.

5. **Multi-Role Governance & Analytics**
   - **ADMIN**: Platform-wide KPIs, revenue graphs (Recharts), inventory distribution, order status breakdown, user management, and audit logs.
   - **DEALER**: Scoped showroom analytics, inventory status distribution, incoming leads, and service visits.
   - **CUSTOMER**: Order history, service bookings, saved wishlist, and profile management.
   - **SERVICE MANAGER**: Live workshop bay queue, pending requests, and job status management.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript (strict mode), Tailwind CSS, Lucide Icons, Recharts |
| **State & Forms** | React Hook Form, Zod schema validation, React Context API (Cart, Comparison, Toast) |
| **Backend** | Next.js Route Handlers, Next.js Server Actions, RESTful APIs |
| **Database** | PostgreSQL 18, Prisma ORM, Database Migrations, Seed Scripts |
| **Authentication** | NextAuth (Credentials Provider), bcryptjs password hashing, JWT sessions, Route Middleware |
| **Testing** | Vitest (Automated test suites for Auth RBAC, E-commerce, Appointments) |

---

## 🔑 Demo Accounts & Credentials

The `/login` screen includes **one-click demo quick-fill buttons** for each role:

| Role | Email | Password | Primary Access Scope |
|---|---|---|---|
| **Admin** | `admin@carcraft.local` | `Password123!` | Complete platform governance & executive analytics |
| **Dealer** | `dealer@carcraft.local` | `Password123!` | Scoped to Apex Motors Mumbai showroom |
| **Customer** | `customer@carcraft.local` | `Password123!` | Personal orders, bookings, wishlist, marketplace |
| **Service Manager** | `service@carcraft.local` | `Password123!` | Scoped to Apex Motors Mumbai service bay |

---

## 📦 Project Structure

```
Car-Craft/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Sign in with 1-click demo accounts
│   │   └── register/page.tsx            # Customer account registration
│   ├── (public)/
│   │   ├── page.tsx                     # Marketplace homepage
│   │   ├── vehicles/                    # Vehicle catalog & [id] detail view
│   │   ├── dealerships/                 # Dealership directory & [slug] profile
│   │   ├── accessories/                 # Accessories e-commerce catalog
│   │   ├── cart/                        # Shopping cart
│   │   ├── checkout/                    # Multi-channel simulated mock checkout
│   │   ├── order-success/               # Order receipt & confirmation
│   │   ├── compare/                     # 3-car side-by-side comparison
│   │   └── services/                    # Service appointment booking wizard
│   ├── (dashboard)/
│   │   ├── admin/                       # Executive analytics, dealerships, users, orders
│   │   ├── dealer/                      # Showroom inventory, inquiries, appointments
│   │   ├── customer/                    # Orders, bookings, wishlist, profile
│   │   └── service-manager/             # Service bay dispatch & job notes
│   ├── api/
│   │   ├── auth/                        # NextAuth handler & registration endpoint
│   │   ├── vehicles/                    # Vehicle inventory CRUD & status updates
│   │   ├── dealerships/                 # Dealership franchise endpoints
│   │   ├── products/                    # Product catalog & stock updates
│   │   ├── orders/                      # Transactional checkout & fulfillment
│   │   ├── appointments/                # Slot reservation & status transitions
│   │   ├── inquiries/                   # Customer vehicle leads
│   │   └── wishlist/                    # Saved vehicles management
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/                          # Public navbar, footer, dashboard shell & sidebar
│   ├── providers/                       # Auth, Toast, Cart, and Compare providers
│   ├── ui/                              # Shadcn-style buttons, inputs, cards, badges
│   ├── vehicles/                        # Vehicle cards, filter bar, gallery, inquiry modal
│   ├── accessories/                     # Catalog grid & category filter tabs
│   ├── services/                        # Service booking wizard & manager table
│   └── dashboard/                       # Recharts revenue & distribution charts
├── lib/
│   ├── auth/                            # NextAuth options, session helpers
│   ├── db/                              # Prisma singleton client
│   ├── permissions/                     # Centralized RBAC rules
│   └── utils.ts                         # Currency (₹) & date formatters
├── prisma/
│   ├── schema.prisma                    # PostgreSQL relational schema
│   ├── migrations/                      # Initial database migration SQL
│   └── seed.ts                          # Comprehensive dataset seed script
├── tests/
│   ├── auth.test.ts                     # Authentication & RBAC unit tests
│   ├── ecommerce.test.ts                # Cart, payment simulation & stock tests
│   └── appointments.test.ts             # Service slot collision & date tests
├── docs/
│   ├── ARCHITECTURE.md                  # Monolithic architecture & security design
│   ├── DATABASE.md                      # Schema data dictionary & Mermaid ER diagram
│   ├── API.md                           # REST API endpoint specifications
│   └── USER_ROLES.md                    # Detailed RBAC permissions matrix
└── package.json
```

---

## ⚡ Quickstart & Local Installation

### Prerequisites
- **Node.js** v18+ (tested on v22)
- **npm** or **pnpm**
- **PostgreSQL** (CarCraft includes a self-contained local PostgreSQL 18 runner, or you can point to any local/cloud PostgreSQL instance)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Car-Craft
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/carcraft?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="carcraft-super-secret-key-32-chars-long-security-token"
```

### 3. Start Local PostgreSQL (Self-Contained)
If you don't already have a PostgreSQL service running on port 5432:
```bash
npm run db:start
```

### 4. Push Schema & Seed Sample Data
```bash
npx prisma db push
npm run db:seed
```

The database will be populated with:
- 4 Dealerships (Mumbai, Bangalore, Delhi NCR, Pune)
- 24 Vehicles across Tata, Mahindra, Hyundai, Toyota, Volkswagen, Skoda, Kia, Honda
- 32 Automotive Accessories across 8 categories
- 10 Customer accounts
- Active orders, reviews, inquiries, and service appointments

### 5. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite to verify authentication rules, e-commerce transactions, and appointment scheduling logic:
```bash
npm test
```

---

## 🏭 Production Build

To verify production readiness:
```bash
npm run build
npm start
```

---

## 📄 Documentation Links
- [Database Design & ER Diagram](docs/DATABASE.md)
- [Architecture & Security Design](docs/ARCHITECTURE.md)
- [REST API Specifications](docs/API.md)
- [User Roles & RBAC Matrix](docs/USER_ROLES.md)
