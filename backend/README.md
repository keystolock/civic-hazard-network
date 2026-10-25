# Civic Hazard Network — Python FastAPI Backend

Production-ready REST API for civic hazard ingestion, Gemini AI verification,
geospatial deduplication, and real-time Telegram emergency alerting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn (async) |
| Validation | Pydantic v2 |
| AI Engine | Google Gemini 2.5 Flash (`google-genai`) |
| Image Dedup | Pillow + `imagehash` (pHash) |
| Spatial Dedup | Haversine formula (pure Python) |
| Alerts | Telegram Bot API via `httpx` |
| Database | SQLite (async via `aiosqlite`) — swap to PostgreSQL for prod |
| Config | `python-dotenv` + `pydantic-settings` |

---

## Project Structure

```
backend/
├── main.py                   # FastAPI app + all 3 API endpoints
├── config.py                 # Settings loaded from .env
├── database.py               # Async SQLAlchemy engine + session dependency
├── models.py                 # ORM models + Pydantic v2 schemas
├── services/
│   ├── ai_service.py         # Gemini 2.5 Flash multimodal verification
│   ├── geo_service.py        # Haversine + perceptual image hash dedup
│   └── telegram_service.py   # Telegram Bot alert dispatcher
├── requirements.txt
├── .env.example              # Template — copy to .env and fill in your keys
└── .gitignore
```

---

## Quick Start

### 1. Create and activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
# Copy the template
copy .env.example .env       # Windows
cp .env.example .env         # macOS / Linux

# Open .env and fill in your real values:
#   GEMINI_API_KEY=...
#   TELEGRAM_BOT_TOKEN=...
#   TELEGRAM_CHAT_ID=...
```

> **Security note:** The `.env` file is in `.gitignore` and will never be committed.

### 4. Run the development server

```bash
uvicorn main:app --reload --port 8000
```

The API is now live at **http://localhost:8000**

- Interactive Swagger docs: http://localhost:8000/docs
- ReDoc docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

---

## API Reference

### `POST /api/reports`
Submit a new hazard report. Accepts `multipart/form-data`.

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Short incident headline (5–255 chars) |
| `description` | string | ❌ | Extended description |
| `category` | string | ✅ | `Disaster` / `Road` / `Utilities` / `Medical` / `Other` |
| `latitude` | float | ✅ | WGS-84 latitude |
| `longitude` | float | ✅ | WGS-84 longitude |
| `severity` | string | ❌ | Self-reported hint: `civic` / `severe` / `extreme` |
| `image` | file | ❌ | Hazard photo (JPEG / PNG / HEIC) |

**Pipeline executed per request:**
1. Saves image to `uploads/`
2. Sends image + metadata to Gemini 2.5 Flash for multimodal verification
3. Checks for spatial duplicates within **250 m** (Haversine) and image duplicates (pHash)
4. Saves verified report to SQLite
5. Dispatches Telegram alert to responder channel
6. Returns full `ReportResponse` JSON

---

### `GET /api/reports`
Returns all hazard reports, newest first.

Optional query parameters:
- `?status_filter=Pending` — filter by status (`Pending` / `Dispatched` / `Resolved`)
- `?category=Disaster` — filter by category

---

### `PATCH /api/reports/{report_id}/status`
Update an incident's lifecycle status.

```json
{ "status": "Dispatched" }
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ | placeholder | Google AI Studio API key |
| `TELEGRAM_BOT_TOKEN` | ✅ | placeholder | Token from @BotFather |
| `TELEGRAM_CHAT_ID` | ✅ | placeholder | Target chat / channel ID |
| `DATABASE_URL` | ❌ | SQLite local | SQLAlchemy async DB URL |
| `FRONTEND_ORIGINS` | ❌ | localhost:3000 | CORS allowed origins |
| `UPLOAD_DIR` | ❌ | `uploads` | Image storage directory |
| `DEDUP_RADIUS_METERS` | ❌ | `250` | Spatial dedup radius |
| `AI_VERIFICATION_ENABLED` | ❌ | `True` | Set `False` to skip AI calls in dev |

---

## Getting your Telegram credentials

1. Open Telegram → search **@BotFather** → `/newbot`
2. Copy the `TELEGRAM_BOT_TOKEN` into `.env`
3. Add your bot to the target group/channel
4. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` after sending a message — read `result[0].message.chat.id`
5. Set that value as `TELEGRAM_CHAT_ID` in `.env`

---

## Production Deployment Notes

- Swap `DATABASE_URL` to `postgresql+asyncpg://user:password@host/db` — zero code changes needed.
- Run with multiple workers: `uvicorn main:app --workers 4 --port 8000`
- Place behind Nginx or a cloud load balancer for SSL termination.
- Store uploaded images in S3/GCS by swapping `_save_upload()` in `main.py`.
