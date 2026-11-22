# WanderApp (Wisata App)

A full-stack tourism discovery and ticket-booking web application built with React, Express, and MySQL. Travelers can browse destinations, view locations on interactive maps, leave reviews, manage a date-based ticket cart, complete checkout, and receive/download PDF E-Ticket vouchers. Destination owners, admins, and superadmins can manage listings, track revenue analytics, and administer privileged accounts through a role-based dashboard.

---

## Features

### Traveler Experience
- **Landing & Featured Showcase**: Animated hero carousel, feature highlights, and dynamically loaded popular destinations.
- **Destination Catalog**: Paginated browsing (`12` items per page by default) with filtering by category, minimum/maximum price, and sorting (newest, lowest price, highest price).
- **Destination Details & Reviews**: Multi-image carousel, ticket stock availability, interactive OpenStreetMap location view (via Leaflet), average rating calculation, and authenticated user reviews (1–5 stars + optional comment, one review per user per destination).
- **Date-Based Cart & Checkout**: Add destination tickets for a specific booking date, manage cart items, select a payment method, and place transactional orders.
- **PDF E-Tickets & Email Delivery**: Automatic PDF E-Ticket voucher generation (`pdfkit`) emailed asynchronously on checkout (`nodemailer`) and downloadable on demand from checkout or profile order history.

### Admin, Owner & Superadmin Panel (`/admin`)
- **Role-Based Access Control (`user`, `owner`, `admin`, `superadmin`)**:
  - `owner`: Create, update, and soft-delete their own destinations; view revenue, ticket counts, and recent orders scoped to their properties.
  - `admin`: Manage all destinations and view platform-wide revenue stats and recent orders.
  - `superadmin`: Full admin capabilities plus privileged account management (`/admin/users`) to create and delete `admin`, `owner`, or `superadmin` accounts.
- **Interactive Location Picker & Multi-Image Upload**: Pick latitude/longitude directly on a Leaflet map and upload up to 5 images per destination via drag-and-drop.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS v4, Axios, Leaflet & React Leaflet, Lucide React, React Hot Toast, Oxlint |
| **Backend** | Node.js, Express 5, MySQL (`mysql2`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-validator`, Multer, PDFKit, Nodemailer |
| **Database** | MySQL (`wisata_db`) |
| **Deployment Config** | Vercel SPA routing (`frontend/vercel.json`) |

---

## Project Structure

```text
.
├── Untitled.fig                  # UI/UX design file
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role guards (admin, owner, superadmin)
│   ├── routes/
│   │   ├── admin.js              # Dashboard stats, orders, admin destinations, user management
│   │   ├── auth.js               # Register, login, current user profile
│   │   ├── cart.js               # Shopping cart CRUD
│   │   ├── destinations.js       # Destinations CRUD, filtering/pagination, reviews
│   │   └── orders.js             # Transactional checkout, order history, PDF E-Ticket download
│   ├── uploads/                  # Static uploaded files & generated ticket PDFs
│   ├── utils/
│   │   └── pdfGenerator.js       # PDFKit E-Ticket voucher builder & file/stream helpers
│   ├── database.sql              # Full MySQL schema and sample seed data
│   ├── db.js                     # MySQL connection pool
│   ├── package.json
│   ├── seed_dests.js             # Standalone destination seeder script
│   ├── server.js                 # Express app entry point
│   └── setup-db.js               # Executes database.sql against MySQL
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/           # Navbar, Footer, Navbar_admin
    │   ├── context/
    │   │   └── AuthContext.jsx   # JWT & user state management
    │   ├── lib/
    │   │   └── api.js            # Axios instance with mode-based baseURL & auth interceptor
    │   ├── pages/
    │   │   ├── admin/            # AdminLayout, AdminDashboard, ManageDestinations, ManageAdmins
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── DestinationDetail.jsx
    │   │   ├── Destinations.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   └── StaticPages.jsx   # About, Blog, Contact, FAQ, How to Order, Legal pages
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vercel.json
    └── vite.config.js            # Dev proxy for /api and /uploads -> localhost:5000
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended) and npm
- MySQL server (local MySQL or a hosted MySQL instance such as Aiven)

### 1. Backend Setup

```bash
cd backend
npm install
```

> **Note on image upload dependencies:** `backend/routes/destinations.js` imports `cloudinary` and `multer-storage-cloudinary`, which are not currently listed in `backend/package.json`. Install them if missing before starting the server:
> ```bash
> npm install cloudinary multer-storage-cloudinary
> ```

Create a `backend/.env` file with your database and secret configuration:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wisata_db
JWT_SECRET=your_jwt_secret

# Optional: SMTP settings for E-Ticket emails (defaults to Ethereal test config)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass

# Optional: Cloudinary credentials for destination image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **MySQL SSL note:** `backend/db.js` enables `ssl: { rejectUnauthorized: false }` for cloud MySQL providers (such as Aiven). If your local MySQL server does not use SSL, remove or conditionally disable the `ssl` option in `backend/db.js`.

### 2. Database Setup & Seeding

You can initialize the `wisata_db` schema and seed sample data by importing `backend/database.sql` directly into MySQL or running:

```bash
# From backend/
node setup-db.js
```

Optionally seed additional destination records with:

```bash
node seed_dests.js
```

The schema script (`backend/database.sql`) creates the following tables: `users`, `destinations`, `carts`, `orders`, `order_items`, and `reviews`, and inserts:
- **4 sample destinations** (Bali Safari Marine Park, Mount Bromo Sunrise Tour, Borobudur Temple Exploration, Raja Ampat Diving Trip)
- **Default Superadmin account**:
  - **Email:** `admin@wanderapp.com`
  - **Password:** `admin123`

Start the backend server:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API server runs on `http://localhost:5000` by default.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Optionally configure `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Note:** `frontend/src/lib/api.js` switches `baseURL` via `import.meta.env.MODE` (`http://localhost:5000/api` in development, `https://wonderapp.onrender.com/api` in production), and a few components (`Landing.jsx`, `Destinations.jsx`, `DestinationDetail.jsx`, `Profile.jsx`, `Checkout.jsx`, `ManageDestinations.jsx`) reference `https://wonderapp.onrender.com` directly when constructing relative `/uploads` image or PDF links. Update those references if you deploy your backend to a different domain.

Run the frontend development server:

```bash
npm run dev
```

Other frontend scripts:

```bash
npm run build     # Build production bundle into dist/
npm run preview   # Preview production bundle locally
npm run lint      # Run oxlint checks
```

---

## API Overview

| Group | Method & Endpoint | Access | Description |
| --- | --- | --- | --- |
| **Health** | `GET /` | Public | API welcome response |
| **Auth** | `POST /api/auth/register` | Public | Register a new `user` account |
| | `POST /api/auth/login` | Public | Authenticate and receive a JWT (1-day expiry) |
| | `GET /api/auth/me` | Authenticated | Fetch current authenticated user profile |
| **Destinations** | `GET /api/destinations` | Public | List active destinations (`page`, `limit`, `category`, `minPrice`, `maxPrice`, `sort`) |
| | `GET /api/destinations/:id` | Public | Get single destination details with average rating & review count |
| | `POST /api/destinations` | `owner`, `admin`, `superadmin` | Create destination with up to 5 images |
| | `PUT /api/destinations/:id` | `owner`, `admin`, `superadmin` | Update destination (`owner` restricted to own listings) |
| | `DELETE /api/destinations/:id` | `owner`, `admin`, `superadmin` | Soft-delete destination (`is_active = FALSE`) |
| **Reviews** | `GET /api/destinations/:id/reviews` | Public | List reviews for a destination |
| | `POST /api/destinations/:id/reviews` | Authenticated | Submit rating (1–5) and optional comment (one per user) |
| **Cart** | `GET /api/cart` | Authenticated | Get current user's cart items |
| | `POST /api/cart` | Authenticated | Add or increment ticket quantity for a `bookingDate` |
| | `DELETE /api/cart/:id` | Authenticated | Remove a cart item |
| **Orders** | `POST /api/orders/checkout` | Authenticated | Create paid order from cart, clear cart, email PDF E-Ticket |
| | `GET /api/orders/history` | Authenticated | Get user's order history and line items |
| | `GET /api/orders/:id/pdf` | Public | Stream/download PDF E-Ticket voucher for an order |
| **Admin** | `GET /api/admin/stats` | `owner`, `admin`, `superadmin` | Revenue, tickets sold, destination count, per-destination breakdown |
| | `GET /api/admin/destinations` | `owner`, `admin`, `superadmin` | List destinations (scoped by `owner_id` for `owner`) |
| | `GET /api/admin/orders` | `owner`, `admin`, `superadmin` | List latest 10 orders |
| | `GET /api/admin/users` | `superadmin` | List all users |
| | `POST /api/admin/users` | `superadmin` | Create privileged account (`admin`, `owner`, `superadmin`) |
| | `DELETE /api/admin/users/:id` | `superadmin` | Delete a user account (cannot delete self) |
