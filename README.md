# GlobeTrotter ✈️

Plan a multi-city trip end-to-end — pick cities, add activities, book flights, track budget in your currency, and share it with a link.

## Features

- Login with email/password or Google
- Build a trip: add cities, activities, and flights
- Itinerary view with list and calendar modes
- Auto-updating budget breakdown (activities + flights)
- Switch currency anywhere — updates prices across the whole app
- Share a trip publicly with a read-only link
- Admin dashboard for usage stats

## Tech Stack

Next.js (App Router, TypeScript) · Tailwind CSS + shadcn/ui · PostgreSQL · Prisma · NextAuth.js

## Getting Started

\`\`\`bash
git clone https://github.com/<your-username>/globetrotter.git
cd globetrotter
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
\`\`\`
## Project Structure

\`\`\`
app/        Pages & API routes
prisma/     Database schema & seed data
lib/        Shared utilities (currency conversion, etc.)
\`\`\`
