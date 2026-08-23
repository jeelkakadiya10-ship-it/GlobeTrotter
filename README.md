# GlobeTrotter ✈️🌍
> Empowering Personalized Multi-City Travel Planning

GlobeTrotter is a full-stack, responsive travel planning web application built with React, TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, and Prisma ORM.

---

## ✨ Features

- **Personalized Dashboard**: Travel stats, upcoming trips overview, and recommended destination hotspots.
- **Interactive Itinerary Builder**:
  - Drag / arrow reordering of multi-city stops.
  - Live stop-level cost subtotals.
  - Interactive activity search with category, duration, and budget filters.
- **Day-Wise Itinerary Views**:
  - Structure by Day 1, Day 2... with city headers.
  - Switch between **List View**, **Timeline View**, and **Grid View** (persists user choice).
- **Flights & Stays with Goibibo Booking**:
  - Add flight details and hotel stays.
  - 1-click **"Book on Goibibo"** CTA linking to pre-filled flight and hotel search.
- **Comprehensive Trip Budget Breakdown**:
  - Interactive donut chart of spending by category (transport, stay, activities, meals, other).
  - Over-budget warning alerts.
  - Manual line item expense entry.
- **Multi-Currency Engine**:
  - Live exchange rates with instant switching between **INR (₹)**, **USD ($)**, **EUR (€)**, and **GBP (£)**.
  - Persisted user preference.
- **Public Itinerary Sharing & 1-Click Clone**:
  - Unique shareable URLs (`/share/:slug`).
  - WhatsApp, X (Twitter), Facebook sharing buttons.
  - 1-click **"Copy This Trip"** clone feature.
- **Offline / Local Saved Trips Manager**:
  - Instant snapshot save with toast confirmations.
- **User Profile & Settings**:
  - Profile update, language preferences, saved destination bookmarks, and account deletion.
- **Platform Admin Dashboard**:
  - Platform usage statistics, trips created over time bar chart, top 10 cities & activities, and user management.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, Recharts, Axios
- **Backend**: Node.js (ES Modules), Express, Prisma ORM, JWT authentication, bcryptjs
- **Database**: PostgreSQL 16
- **Tooling**: Vite, Concurrently, Nodemon

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL 15+ running on `localhost:5432`

### 2. Clone & Install
```bash
git clone https://github.com/jeelkakadiya10-ship-it/GlobeTrotter.git
cd GlobeTrotter

# Install monorepo, backend, and frontend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Database Setup
1. Create a PostgreSQL database named `globetrotter`.
2. Configure `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter?schema=public"
   JWT_SECRET="globetrotter-super-secret-jwt-key-2026"
   ```
3. Run Prisma schema migration and populate seed data (16 world cities, 80+ activities, test accounts):
   ```bash
   cd backend
   npx prisma db push
   node prisma/seed.js
   cd ..
   ```

### 4. Run Locally
From the root directory:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Login Credentials

- **Traveler Account**:
  - Email: `traveler@globetrotter.com`
  - Password: `password1234`
- **Admin Account**:
  - Email: `admin@globetrotter.com`
  - Password: `admin1234`

---

## 📂 Project Structure

```
GlobeTrotter/
├── package.json              # Monorepo root script (runs backend + frontend concurrently)
├── .gitignore
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Relational schema (7 tables with ON DELETE CASCADE)
│   │   └── seed.js           # 16 Cities, 80+ activities, demo trips and users
│   ├── src/
│   │   ├── controllers/      # REST API Controllers (auth, trips, stops, budget, admin, etc.)
│   │   ├── middleware/       # JWT Authentication & Admin Role guards
│   │   ├── routes/           # Express API router
│   │   └── index.js          # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI (Navbar, Footer, Modals, Flight/Stay, DayView, etc.)
    │   ├── context/          # AuthContext, CurrencyContext, ToastContext
    │   ├── pages/            # 12+ Pages (Dashboard, Builder, View, Budget, Search, Admin, etc.)
    │   ├── services/         # Axios API client
    │   ├── types/            # TypeScript data definitions
    │   ├── App.tsx           # Route definitions & guards
    │   └── main.tsx          # Application root
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```