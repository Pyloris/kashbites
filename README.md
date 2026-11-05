# KashBites — A Taste of Kashmir 🌰🏔️

> Premium Kashmir-Origin Dry Fruits E-Commerce Platform built with React, Node.js + Express, and MongoDB.

Inspired by the authentic packaging design system of **KashBites**: featuring deep Himalayan forest greens, regal gold foil Chinar accents, hand-drawn mountain topography, and airtight cold-packaging in Srinagar.

---

## 🎨 Design System & Brand Extraction

Extracted directly from the attached packaging artwork:
- **Primary Royal Forest Green**: `#0E331E` & `#143E26`
- **Himalayan Saffron & Chinar Gold**: `#C59432` & `#DFB248`
- **Pashmina Ivory & Warm Parchment**: `#FAF7F2` & `#FCFAF5`
- **Walnut Shell Amber**: `#8B572A`
- **Typography Pairing**:
  - *Headlines & Hero Brand*: `Cormorant Garamond` (Regal Kashmiri Display Serif)
  - *Prose & Telemetry*: `Plus Jakarta Sans` & `font-mono tabular-nums`

### Core Trust Pillars (Packaging Icons)
1. **Kashmir Origin**: 100% single-origin harvest from Shopian & Pulwama valleys.
2. **Direct from Growers**: Fair-trade partnerships with generational farming families.
3. **Carefully Selected & Packed**: Triple sorting, zero chemical bleach, cold nitrogen vacuum sealed.
4. **Quality You Can Trust**: Lab tested, <4% moisture content, zero aflatoxins, and 100% untreated.

---

## 📁 Project Architecture & Folder Structure

```text
├── docker-compose.yaml        # Full-stack orchestrator (MongoDB 7.0 + Express + React)
├── .env.example               # Environment variables configuration
├── package.json               # Root unified full-stack scripts
├── server.ts                  # Root full-stack server running Express + Vite dev middleware
│
├── backend/                   # Node.js + Express + MongoDB Service
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── config/            # Database connection & graceful memory fallback
│       ├── controllers/       # Product, Order, and Review handlers
│       ├── models/            # Mongoose schemas (Product, Order, Review)
│       ├── routes/            # REST API endpoints (/api/products, /api/orders, /api/reviews)
│       ├── data/              # Authentic Kashmiri seed dataset with packaging pictures
│       ├── app.ts             # Express app setup and middleware configuration
│       └── server.ts          # Standalone backend server entrypoint
│
├── frontend/                  # React + Vite + Tailwind CSS Service
│   ├── Dockerfile
│   └── package.json
│
├── src/                       # React Application Source
│   ├── components/
│   │   ├── common/            # Brand Logo, Packaging Trust Badges
│   │   ├── layout/            # Top Bar Contract Navbar, Announcement Bar, Footer
│   │   ├── home/              # HeroBanner, TrustSection, CategoryBar, SignatureBoxBanner
│   │   ├── product/           # ProductCard, ProductDetailPage (Gallery, Purchase Module)
│   │   └── modals/            # CertificateModal, PackagingVideoModal, CartDrawer, CheckoutModal, OrderTrackingModal
│   ├── context/               # CartContext (Cart state, coupons, checkout, persistence)
│   ├── services/              # API client service layer
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # Main application view manager
│   ├── main.tsx               # Entrypoint
│   └── index.css              # Tailwind CSS styling
```

---

## 🚀 Quick Start with Docker Compose

To spin up MongoDB, the Express backend, and the React frontend in isolated containers:

```bash
# 1. Clone repository and navigate
cp .env.example .env

# 2. Start full-stack with Docker Compose
docker-compose up --build
```

- **Frontend Web Store**: `http://localhost:3000`
- **Backend Express API**: `http://localhost:5000/api`
- **MongoDB Database**: `mongodb://localhost:27017/kashbites`

---

## 🛠️ Local Development (Single Command)

```bash
npm install
npm run dev
```
Runs the unified full-stack server on port `3000` with hot-module reload for the frontend and instant Express backend API responses.
