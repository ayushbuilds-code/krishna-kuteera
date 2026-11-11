# Krishna Kuteera — Multi-Outlet Restaurant Website & Admin Platform

A production-ready, mobile-first web application and operations suite for **Krishna Kuteera** (`ಕೃಷ್ಣ ಕುಟೀರ`), a 100% pure-vegetarian South Indian restaurant chain in Bengaluru.

## Architecture & Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security, Realtime)
- **Payments:** Razorpay Checkout (UPI, Cards, Netbanking) + Pay-at-Counter for pickup
- **Hosting:** Vercel (`vercel.json` SPA rewrites & immutable asset caching)
- **Branding:** Single-file central theme & business config in `src/config/brand.ts`

---

## Features Overview

### Part A — Public Customer Website
- **Home (`/`):** Signboard-matched theme, 2-tap **"Breakfast Near Me"** geolocation shortcut, Today's Specials, Outlet Finder, Popular Dishes, Guest Testimonials, and Photo Gallery.
- **Outlets (`/outlets`, `/outlets/:slug`):** Per-outlet hours, parking, AC / Non-AC / Outdoor seating details, Google Maps embed, "Get Directions", and JSON-LD `Restaurant` schema.
- **Menu (`/menu`):** Category tabs (`Breakfast`, `Meals`, `Tiffins`, `Chaats`, `Beverages`, `Sweets`, `KK Bakers`), search, Jain / No-Onion-Garlic / Bestseller / Today's Special / Spice filters, Pure-Veg badges on every dish, and live per-outlet pricing & availability.
- **Online Ordering (`/checkout`, `/track-order`):** Pickup & Delivery cart drawer, GST calculation (5%), promo coupons (`KKWELCOME`, `MORNING15`, `FAMILY100`), loyalty points lookup & redemption, Razorpay payment, live 4-step order tracker (`Received → Preparing → Ready → Out for Delivery`), and post-order feedback + Google Review link.
- **Table Reservations (`/reserve`):** Live slot capacity checking (`get_slot_availability` RPC + DB anti-overbooking trigger) and WhatsApp / SMS / Email confirmation.
- **Bulk & Catering (`/catering`):** Event catering quote-request workflow with South Indian menu format selectors.
- **KK Bakers (`/bakery`):** Toggleable via `BRAND.features.enableBakerySection` in `src/config/brand.ts` with pre-order date support for eggless celebration cakes.

### Part B — Staff & Owner Admin Panel (`/admin`)
- **Role-Based Access:** `Owner` (all outlets), `Outlet Manager`, `Kitchen Staff`, and `Cashier` (strictly outlet-scoped via RLS & UI guards).
- **Dashboard (`/admin`):** Today's sales, order count, average order value, top dishes, low-stock alerts, and multi-outlet comparison.
- **Live Order Board (`/admin/orders`):** 4-column Kanban (`New Orders`, `Preparing`, `Ready`, `Completed`), Web Audio chime alerts, Supabase Realtime sync, and printable **KOT & GST Tax Invoice**.
- **Menu & 1-Click Sold Out (`/admin/menu`):** Mark any item unavailable in 1 click, edit per-outlet prices inline, or add/edit master dishes.
- **Tables & Reservations (`/admin/tables`):** Dining floor view (`available` / `occupied` / `reserved`), confirm/seat/cancel bookings, and walk-in guest entry.
- **Outlets & Hours (`/admin/outlets`):** Add, edit, or disable outlets, timings, and scheduled holidays.
- **Inventory & Wastage (`/admin/inventory`):** Stock levels, low-stock reorder alerts, purchases, usage, and wastage logs.
- **Staff & Shifts (`/admin/staff`):** Staff directory, shift assignment, and daily attendance tracking.
- **Customers CRM (`/admin/crm`):** Guest lifetime spend, loyalty points, review moderation, and catering quote management.
- **Sales & GST Reports (`/admin/reports`):** Daily / Weekly / Monthly summaries with CGST/SGST breakdown and CSV export.
- **Website Content Editor (`/admin/content`):** Update announcement bar, hero headline, and daily specials banner without touching code.

---

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   > **Demo Mode:** If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are left unset, the app automatically runs in local demo mode using seeded data (`src/data/mockSeed.ts`) and `localStorage` persistence so you can preview every public and admin workflow immediately.

3. **Run dev server, tests, lint & production build**
   ```bash
   npm run dev
   npm test
   npm run lint
   npm run build
   ```

---

## Deployment Guide (Supabase + Vercel)

### 1. Supabase Setup
1. Create a new project in [Supabase](https://supabase.com) (Mumbai `ap-south-1` region recommended for Bengaluru low latency).
2. Open **SQL Editor** and run `supabase/migrations/001_initial_schema.sql` to create all 19 tables, indexes, triggers (`check_reservation_capacity`, `apply_stock_movement`), RPCs (`get_slot_availability`, `track_order_public`), and RLS policies.
3. Run `supabase/seed.sql` in **SQL Editor** to load the 3 Bengaluru outlets, 7 categories, 32 pure-veg dishes, per-outlet pricing, tables, coupons, and sample inventory.
4. Go to **Database → Replication** and verify `orders`, `outlet_menu_prices`, `reservations`, and `tables` are enabled in `supabase_realtime`.
5. Create staff accounts in **Authentication → Users**, then insert matching rows into `public.staff` linking `auth_user_id` to the user's UUID, `role` (`owner`, `outlet_manager`, `kitchen_staff`, `cashier`), and `outlet_id` (`NULL` for `owner`).

### 2. Razorpay Setup
1. Create a Razorpay Merchant account and complete KYC.
2. Copy your **Key ID** (`rzp_test_...` for staging or `rzp_live_...` for production) into `VITE_RAZORPAY_KEY_ID`.
3. Never expose your Razorpay Key Secret in `VITE_*` client env variables. For server-side payment signature verification in production, deploy a Supabase Edge Function using the secret key.

### 3. Vercel Deployment
1. Push the repository to GitHub/GitLab/Bitbucket and import it into [Vercel](https://vercel.com).
2. Framework preset: **Vite** (`npm run build`, output directory `dist`).
3. Add all variables from `.env.example` under **Project Settings → Environment Variables**.
4. Deploy — `vercel.json` handles SPA client routing and immutable asset caching automatically.
5. Connect your custom domain (e.g. `krishnakuteera.in`) and update `VITE_SITE_URL` + `public/sitemap.xml` / `public/robots.txt` if needed.

