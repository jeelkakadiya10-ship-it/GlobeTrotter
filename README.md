# 🌍 GlobeTrotter — Multi-City Trip Itinerary Planner

Turn "I want to visit 3 cities in Europe" into a day-by-day, budgeted, shareable itinerary in under 5 minutes.

## 🚀 Features

- **Multi-City Itinerary Builder:** Add, remove, and reorder city stops with desktop Drag & Drop or mobile touch arrow fallbacks.
- **Activity Discovery & Scheduling:** Scoped activity catalog with category filters, duration, and price estimates.
- **Dynamic Budget Tracker:** Auto-syncs activity costs with custom expense line items (flights, hotels, food).
- **Timeline & Day-by-Day Calendar:** Interactive view modes with day cards and hourly scheduled activities.
- **Public Itinerary Sharing:** Shareable public links (`/share/:public_slug`) viewable with zero authentication.
- **1-Click "Copy Trip":** Clone any public itinerary into your personal account.
- **Admin Governance Portal:** Server-side role-gated analytics dashboard with real platform statistics and user account moderation.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express REST API, JWT Authentication, bcrypt password hashing
- **Database:** Prisma ORM, Relational SQLite / PostgreSQL compatible schema

## 📦 Getting Started

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Set up Database & Demo Data
```bash
cd server
npx prisma generate
npx prisma db push
npm run seed
cd ..
```

### 3. Run Development Servers
```bash
npm run dev
```

Frontend will run at `http://localhost:5173` and backend API at `http://localhost:5000`.

## 🔑 Demo Credentials

- **Traveler User:** `traveler@globetrotter.com` / `password123`
- **Admin User:** `admin@globetrotter.com` / `admin123`
