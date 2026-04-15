# LeadMap Pro — Maps-Based Lead Scraping Platform

A production-ready SaaS application for scraping business leads from Google Maps with precision geo-filtering, lead scoring, and one-click XLSX/CSV export.

## Features

- 🔍 **Grid-Based Search** — Covers entire radius with overlapping grid points
- 📍 **Strict Geo-Filtering** — Haversine distance check prevents location leakage
- 🏆 **Lead Scoring** — 0-100 score based on website, rating, reviews, phone, email
- 📊 **Rich Dashboard** — Sortable, searchable, paginated lead table with stats
- 📥 **Export** — XLSX and CSV with proper column formatting
- ⚡ **Job System** — Non-blocking background scraping with live progress bar
- 🔐 **Firebase Auth** — Email/password authentication
- 📧 **Email Extraction** — Optional website crawling for contact emails
- 🌙 **Dark Mode** — Premium glassmorphism UI with gradient effects

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Maps API:** Google Places API + Geocoding API
- **UI:** Tailwind CSS + shadcn/ui
- **Export:** xlsx npm package

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore & Auth enabled
- Google Cloud project with Places API & Geocoding API enabled

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/PiarujjamanPolash/mapscraper.git
   cd mapscraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from example:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables (Firebase + Google API keys)

5. Run the dev server:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`

### Environment Variables

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

GOOGLE_PLACES_API_KEY=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Usage

1. **Sign up** for an account
2. **Enter search parameters** — industry, niche, city, radius
3. **Click "Find Leads"** — grid search runs in background
4. **View results** — sortable table with scores and contact info
5. **Export** — download as XLSX or CSV

## Project Structure

```
src/
├── app/
│   ├── api/scrape/       # POST — Start scraping job
│   ├── api/jobs/         # GET — Job status polling
│   ├── api/leads/        # GET — Paginated lead fetch
│   ├── api/export/       # GET — XLSX/CSV download
│   ├── dashboard/        # Main dashboard page
│   └── signup/           # User registration
├── components/           # React components
├── lib/                  # Core utilities (maps, grid, scraper, firebase)
└── types/                # TypeScript interfaces
```

## License

MIT
