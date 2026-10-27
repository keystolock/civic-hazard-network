<div align="center">

# 🚨 Civic Hazard Network

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

**AI-Powered Real-Time Civic Hazard Ingestion, Spatial Deduplication & Emergency Dispatch System**

</div>

---

## 🌍 Overview

Traditional civic emergency and hazard reporting workflows suffer from:
- **Duplicate incident reports** overwhelming control rooms during disasters
- **Delayed first-responder dispatch** due to manual routing and validation
- **Lack of verification** leading to spam and resource wastage
- **Poor real-time geospatial visibility** for emergency teams
- **Costly legacy dispatch infrastructure** inaccessible to smaller municipal agencies

The **Civic Hazard Network** addresses these challenges through an end-to-end automated platform featuring **Gemini 2.5 Flash multimodal AI verification**, **Haversine 250m geospatial clustering**, **perceptual image hash (pHash) deduplication**, an **interactive Leaflet live map**, and **zero-cost Telegram responder dispatching**.

---

## ✨ Key Features

### 🧠 AI-Powered Hazard Verification (Gemini 2.5 Flash)
- **Multimodal Visual Inspection:** Validates uploaded citizen photos against spam, AI-generated imagery, and non-hazards.
- **Incident Categorization:** Automatically maps incidents to Disaster, Road, Utilities, or Medical categories.
- **Automated Severity Scoring:** Scores emergency level from **1** (minor civic complaint) to **5** (life-threatening natural hazard).
- **Safety Guidance Generation:** Produces concise, actionable public safety and evacuation advice.

### 📍 Smart Geospatial & Visual Deduplication
- **Spatial Clustering (Haversine Formula):** Automatically calculates great-circle distances and identifies duplicate reports submitted within a **250-meter radius**.
- **Visual Deduplication (pHash):** Uses 64-bit Discrete Cosine Transform (DCT) Perceptual Hashing to identify visually identical photos across varying compressions, resolutions, and lighting conditions.
- **Ticket Linking:** Merges secondary submissions into the primary high-priority ticket, keeping responder channels clean and un-spammed.

### 🗺️ Live Incident Monitoring & Dashboard
- **Interactive Leaflet Live Map:** Built with vanilla Leaflet lifecycle controls to eliminate React StrictMode container-reuse crashes.
- **Free OpenStreetMap Tiles:** 100% public tile server integration without API key watermarks or billing caps.
- **Color-Coded Severity Pins:** Immediate visual distinction between `🔴 Extreme`, `🟠 Severe`, `🟡 Civic`, and `🟢 Resolved` incidents.
- **Incident Filtering & Panning:** Smooth auto-panning (`map.flyTo`) when selecting tickets from the dashboard feed.

### 🚨 Zero-Cost Emergency Responder Dispatch (Telegram)
- **Real-Time Broadcasts:** Instant alerts dispatched via Telegram Bot API using asynchronous HTTP (`httpx`).
- **Rich HTML Cards:** Outlines title, category, severity, coordinates, AI summary, and safety guidelines.
- **Interactive Inline Buttons:**
  - `[ ✅ Accept & Dispatch ]`: Direct responder claim callback.
  - `[ 🗺 View on Live Map ]`: Deep-links directly to the incident pin on the live dashboard.

### 📱 3-Step Citizen Reporting Workflow
- **Step 1 (Location):** HTML5 high-accuracy GPS capture with Nominatim reverse-geocoding and graceful area fallbacks.
- **Step 2 (Details):** Headline, incident description, category selection, and self-reported severity hints.
- **Step 3 (Media & SOS Dispatch):** Photo upload with client-side preview, hash indicator, and a **3-stage full-screen crimson origami paper plane animation** (`Sending...` ➔ `Launching` ➔ `Message sent`).

---

## 🏗️ System Architecture

```text
[ Citizen Web Client (Desktop / Mobile) ]
                   │
                   ▼  POST /api/reports (Multipart Form + Photo)
       [ Next.js 16 App Router ]
                   │
                   ▼  Proxy / Direct API Call
      [ FastAPI Asynchronous Backend ]
                   │
    ┌──────────────┼───────────────────────────┐
    │              │                           │
    ▼              ▼                           ▼
[ Uploads ]  [ Gemini 2.5 Flash ]   [ Geospatial & Vision Engine ]
  (UUID)       • Authenticity check   • Haversine distance (< 250m)
               • Severity score (1-5) • Perceptual pHash similarity
               • AI summary & safety
    │              │                           │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    [ SQLite / PostgreSQL DB ]  (Async SQLAlchemy 2.0)
                   │
                   ▼
    [ Telegram Bot API Dispatcher ]  (Async HTTPX)
                   │
                   ▼
   [ First Responders (Telegram Groups / Channels) ]
   ├── [ ✅ Accept & Dispatch ]
   └── [ 🗺 View on Live Map ]
```

---

## ⚙️ Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.x` | App Router, SSR & client components |
| **React** | `19.x` | Interactive UI components |
| **TypeScript** | `5.x` | End-to-end type safety |
| **Tailwind CSS** | `3.4` | Modern utility-first styling |
| **Framer Motion** | `12.x` | SOS dispatch animations & transitions |
| **Leaflet** | `1.9` | Interactive geospatial mapping |
| **Lucide React** | `latest` | Clean system icon library |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | `0.115` | High-performance asynchronous API |
| **Uvicorn** | `0.34` | Production ASGI web server |
| **SQLAlchemy** | `2.0` | Asynchronous ORM |
| **aiosqlite** | `0.21` | Non-blocking SQLite driver |
| **Pydantic** | `v2.14` | Robust schema validation & serialization |
| **Google GenAI** | `1.16` | Gemini 2.5 Flash multimodal SDK |
| **Pillow & imagehash**| `13.0 / 4.3`| Perceptual image hashing (pHash) |
| **HTTPX** | `0.28` | Async client for Telegram Bot API |
| **Pytest** | `8.3` | Test runner for API and geospatial logic |

---

## 📂 Project Structure

```text
civic-hazard-network/
├── backend/
│   ├── main.py                     # FastAPI application, CORS & route endpoints
│   ├── config.py                   # Pydantic-Settings configuration (reads .env)
│   ├── database.py                 # Async SQLAlchemy engine & session dependency
│   ├── models.py                   # ORM models and Pydantic v2 schemas
│   ├── services/
│   │   ├── ai_service.py           # Gemini 2.5 Flash multimodal verification
│   │   ├── geo_service.py          # Haversine distance & pHash image dedup
│   │   └── telegram_service.py     # Telegram Bot alert dispatcher
│   ├── tests/
│   │   ├── test_api.py             # 7 API endpoint integration tests (ASGI)
│   │   └── test_geo_service.py     # 11 unit tests for Haversine & dedup
│   ├── uploads/                    # Local storage for uploaded hazard photos
│   ├── requirements.txt            # Pinned Python dependencies
│   ├── .env.example                # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # App root shell & fonts
│   │   │   ├── page.tsx            # Home landing page
│   │   │   ├── dashboard/page.tsx  # Live incident map & monitoring view
│   │   │   ├── report/page.tsx     # 3-step incident report flow & SOS trigger
│   │   │   ├── alerts/page.tsx     # Incident broadcast feed
│   │   │   └── about/page.tsx      # System architecture overview
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation header & notification permissions
│   │   │   ├── dashboard/
│   │   │   │   ├── LiveMap.tsx     # Native Leaflet interactive map
│   │   │   │   └── IncidentCard.tsx# Incident cards with severity badges
│   │   │   ├── report/
│   │   │   │   └── SosDispatchOverlay.tsx # 3-stage SOS dispatch animation
│   │   │   └── shared/
│   │   │       └── TimeAgo.tsx     # Client-safe hydration relative time
│   │   ├── lib/
│   │   │   ├── types.ts            # Frontend TypeScript type declarations
│   │   │   └── mockData.ts         # Fallback mock data and coordinates
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── LICENSE                         # MIT License
└── README.md                       # Master Documentation
```

---

## 🔑 Environment Variables & Setup

Copy the example configuration file in `backend/`:

```powershell
cd backend
Copy-Item .env.example .env     # Windows
cp .env.example .env           # Linux / macOS
```

Configure the following variables in `backend/.env`:

```env
# ── Google Gemini AI ───────────────────────────────────────────────────────────
# Get your key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=YOUR_API_KEY_HERE

# ── Telegram Emergency Alerts ──────────────────────────────────────────────────
# Create a bot with @BotFather on Telegram to obtain the token
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE

# The Chat ID or Channel ID where alerts are delivered
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID_HERE

# ── Database ───────────────────────────────────────────────────────────────────
# Default local SQLite file; replace with postgresql+asyncpg:// for production
DATABASE_URL=sqlite+aiosqlite:///./civic_hazard.db

# ── CORS & Server ──────────────────────────────────────────────────────────────
FRONTEND_ORIGINS=http://localhost:3000
UPLOAD_DIR=uploads
```

---

## 🚀 Step-by-Step VS Code Run Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x, v20.x, or v22.x LTS)
- [Python](https://www.python.org/downloads/) (v3.11, v3.12, or v3.14)
- [Visual Studio Code](https://code.visualstudio.com/)

---

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Select **File** ➔ **Open Folder...** (or `Ctrl+K Ctrl+O`).
3. Select the `civic-hazard-network` folder.

---

### Step 2: Run the Backend Server (Terminal 1)

1. Open an integrated terminal in VS Code (`Ctrl+~` or **Terminal** ➔ **New Terminal**).
2. Execute the following commands:

```powershell
# Navigate into backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

✅ **Backend URLs:**
- **API Server:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **Health Check:** `http://localhost:8000/health`

---

### Step 3: Run the Frontend Server (Terminal 2)

1. Split your terminal or open a second terminal tab (**Terminal** ➔ **New Terminal**).
2. Execute:

```powershell
# Navigate into frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```

✅ **Frontend Application:**
- Open your browser at **`http://localhost:3000`**
  - `/` — System overview & live incident status counts
  - `/report` — 3-step reporting wizard with GPS auto-detect & SOS dispatch animation
  - `/dashboard` — Interactive Leaflet live map with incident filters
  - `/alerts` — Emergency alert broadcasts
  - `/about` — Architecture & platform details

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Request Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server health check & timestamp | None |
| `POST` | `/api/reports` | Ingests, verifies via Gemini, deduplicates, saves to DB & dispatches Telegram alert | `multipart/form-data` (`title`, `description`, `category`, `latitude`, `longitude`, `severity`, `image`) |
| `GET` | `/api/reports` | Retrieves all active hazard reports | Query parameters: `?status_filter=Pending&category=Disaster` |
| `PATCH`| `/api/reports/{id}/status` | Updates report lifecycle status | JSON: `{"status": "Dispatched"}` |
| `GET` | `/uploads/{filename}`| Static access to uploaded hazard images | None |

---

## 🧪 Automated Test Suite

The backend contains **18 automated tests** validating geodetic math, image hashing, duplicate clustering, and API route lifecycles:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest tests/ -v
```

```text
======================== 18 passed in 1.45s ========================
tests/test_geo_service.py::TestHaversine::test_same_point_is_zero PASSED
tests/test_geo_service.py::TestHaversine::test_connaught_place_to_india_gate PASSED
tests/test_geo_service.py::TestHaversine::test_within_250m_threshold PASSED
tests/test_geo_service.py::TestHaversine::test_outside_250m_threshold PASSED
tests/test_geo_service.py::TestCheckDuplicates::test_no_existing_reports_is_not_duplicate PASSED
tests/test_geo_service.py::TestCheckDuplicates::test_nearby_report_is_duplicate PASSED
tests/test_geo_service.py::TestCheckDuplicates::test_far_report_is_not_duplicate PASSED
tests/test_geo_service.py::TestCheckDuplicates::test_resolved_report_excluded_from_dedup PASSED
tests/test_geo_service.py::TestCheckDuplicates::test_closest_match_selected PASSED
tests/test_geo_service.py::TestComputeImageHash::test_returns_none_for_invalid_bytes PASSED
tests/test_geo_service.py::TestComputeImageHash::test_valid_image_returns_hex_string PASSED
tests/test_api.py::test_health_check PASSED
tests/test_api.py::test_list_reports_empty PASSED
tests/test_api.py::test_create_report_no_image PASSED
tests/test_api.py::test_create_report_returns_duplicate_info PASSED
tests/test_api.py::test_list_reports_populated PASSED
tests/test_api.py::test_update_status PASSED
tests/test_api.py::test_update_nonexistent_report_returns_404 PASSED
```

---

## 🔒 Fault Tolerance & Resilience

- **No Gemini API Key?** If `GEMINI_API_KEY` is omitted or left as placeholder, the backend gracefully falls back to an unverified stub state without crashing. Reports are still deduplicated, persisted, and visualized on the map.
- **No Telegram Credentials?** If `TELEGRAM_BOT_TOKEN` is unset, alerts are skipped cleanly without blocking or failing report submissions.
- **Leaflet Map Resilience:** Raw DOM container references with cleanup handlers prevent memory leaks and React StrictMode double-mounting crashes.
- **Database Scalability:** Powered by asynchronous SQLAlchemy sessions, enabling an immediate switch to PostgreSQL in production by updating `DATABASE_URL`.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](../LICENSE) file for details.
