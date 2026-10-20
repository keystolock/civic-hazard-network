"""
main.py — Civic Hazard Network FastAPI Application
====================================================
Startup:
    uvicorn main:app --reload --port 8000

Endpoints:
    POST   /api/reports                     Ingest + verify + deduplicate + broadcast
    GET    /api/reports                     Return all active hazard reports
    PATCH  /api/reports/{report_id}/status  Update lifecycle status

Architecture overview:
    1. Request arrives at POST /api/reports (multipart form + image file)
    2. Gemini 2.5 Flash verifies the image and assigns severity
    3. geo_service deduplicates against existing DB rows (spatial + image hash)
    4. Report saved to SQLite via async SQLAlchemy
    5. Telegram alert dispatched asynchronously
    6. Full ReportResponse JSON returned to the Next.js frontend
"""

from __future__ import annotations

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db, init_db
from models import (
    DuplicateInfo,
    HazardReport,
    ReportResponse,
    StatusUpdateRequest,
    orm_to_response,
)
from services.ai_service import verify_hazard_with_gemini
from services.geo_service import check_duplicates
from services.telegram_service import dispatch_telegram_alert

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("civic_hazard")


# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once at startup to:
      • Create DB tables (idempotent)
      • Ensure the upload directory exists
    """
    logger.info("🚀 Civic Hazard Network API starting up…")
    await init_db()

    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    logger.info("📁 Upload directory ready: %s", upload_path.resolve())

    yield  # Application runs here

    logger.info("🛑 Civic Hazard Network API shutting down.")


# ─── FastAPI Application ──────────────────────────────────────────────────────

app = FastAPI(
    title="Civic Hazard Network API",
    version="1.0.0",
    description=(
        "Production-ready incident ingestion, Gemini AI verification, "
        "geospatial deduplication, and Telegram emergency alerting."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ─── CORS Middleware ──────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,   # e.g. ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ─── Static File Serving (uploaded images) ────────────────────────────────────
# The Next.js frontend can reference uploaded images at:
#   http://localhost:8000/uploads/<filename>

app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"], summary="API health probe")
async def health_check():
    """Returns 200 OK with a status message. Used by load balancers / CI pipelines."""
    return {
        "status": "ok",
        "service": "Civic Hazard Network API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── Helper: Save uploaded file to disk ──────────────────────────────────────

async def _save_upload(file: UploadFile) -> tuple[str, bytes, str]:
    """
    Persist the uploaded image to UPLOAD_DIR with a UUID filename.

    Returns
    -------
    tuple of (saved_filename, raw_bytes, mime_type)
    """
    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = Path(settings.UPLOAD_DIR) / filename

    content = await file.read()
    dest.write_bytes(content)
    logger.info("Saved upload: %s (%d bytes)", dest, len(content))

    return filename, content, file.content_type or "image/jpeg"


# ─── POST /api/reports ────────────────────────────────────────────────────────

@app.post(
    "/api/reports",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Reports"],
    summary="Submit a new hazard report",
)
async def create_report(
    # ── Form fields (multipart) ───────────────────────────────────────────────
    title: str = Form(..., description="Short incident headline (min 5 chars)"),
    description: Optional[str] = Form(None, description="Extended description"),
    category: str = Form(..., description="Disaster | Road | Utilities | Medical | Other"),
    latitude: float = Form(..., ge=-90.0, le=90.0),
    longitude: float = Form(..., ge=-180.0, le=180.0),
    severity: str = Form("civic", description="Self-reported severity hint"),
    reporter_id: Optional[str] = Form(None),
    # ── Optional image upload ─────────────────────────────────────────────────
    image: Optional[UploadFile] = File(None, description="Hazard photo (JPEG / PNG / HEIC)"),
    # ── DB session ───────────────────────────────────────────────────────────
    db: AsyncSession = Depends(get_db),
):
    """
    Full ingestion pipeline for a new civic hazard report:

    1. Save the uploaded image to disk (if provided).
    2. Run Gemini 2.5 Flash multimodal verification on the image.
    3. Check for spatial + image-hash duplicates against existing reports.
    4. Persist the verified report to the database.
    5. Dispatch a Telegram alert to the emergency responder channel.
    6. Return the full ReportResponse JSON.
    """

    logger.info(
        "New report received — title=%r category=%s severity=%s coords=(%.4f, %.4f)",
        title, category, severity, latitude, longitude,
    )

    # ── Step 1: Persist uploaded image ───────────────────────────────────────
    image_filename: Optional[str] = None
    image_bytes: Optional[bytes] = None
    image_mime: str = "image/jpeg"

    if image and image.filename:
        image_filename, image_bytes, image_mime = await _save_upload(image)

    # ── Step 2: Gemini AI verification ───────────────────────────────────────
    verification = await verify_hazard_with_gemini(
        image_bytes=image_bytes,
        image_mime=image_mime,
        title=title,
        description=description,
        category=category,
    )
    logger.info(
        "AI verification → verified=%s severity_score=%d summary=%r",
        verification.ai_verified, verification.severity_score, verification.ai_summary,
    )

    # ── Step 3: Deduplication check ───────────────────────────────────────────
    result = await db.execute(select(HazardReport))
    all_reports: List[HazardReport] = list(result.scalars().all())

    dedup = check_duplicates(
        new_lat=latitude,
        new_lon=longitude,
        new_image_bytes=image_bytes,
        existing_reports=all_reports,
    )
    logger.info(
        "Dedup check → is_duplicate=%s matched_id=%s distance=%.1fm",
        dedup.is_duplicate,
        dedup.matched_id or "—",
        dedup.distance_m or 0.0,
    )

    # Build the DuplicateInfo response object (always included, even if not a dupe)
    duplicate_info = DuplicateInfo(
        is_duplicate=dedup.is_duplicate,
        matched_report_id=dedup.matched_id,
        distance_meters=dedup.distance_m,
        image_similarity=dedup.image_similarity,
    )

    # ── Step 4: Persist to database ───────────────────────────────────────────
    report_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)

    # Use AI severity if verification passed; fall back to self-reported label
    final_severity_label = (
        verification.severity_label if verification.ai_verified else severity
    )
    # Map label → integer score for the DB column
    label_to_score = {"civic": 1, "severe": 3, "extreme": 5}
    final_severity_score = (
        verification.severity_score
        if verification.ai_verified
        else label_to_score.get(severity, 1)
    )

    new_report = HazardReport(
        id=report_id,
        title=title,
        description=description,
        category=category,
        latitude=latitude,
        longitude=longitude,
        severity=final_severity_score,
        severity_label=final_severity_label,
        ai_summary=verification.ai_summary,
        ai_verified=1 if verification.ai_verified else 0,
        safety_note=verification.safety_note,
        image_url=f"{settings.UPLOAD_DIR}/{image_filename}" if image_filename else None,
        image_hash=dedup.new_image_hash,
        status="Pending",
        timestamp=now_utc,
        reporter_id=reporter_id,
    )
    db.add(new_report)
    await db.flush()   # Assign the ID without committing yet

    logger.info("Report %s saved to database (pre-commit flush)", report_id)

    # ── Step 5: Telegram alert dispatch ───────────────────────────────────────
    telegram_ok = await dispatch_telegram_alert(
        report_id=report_id,
        title=title,
        category=category,
        severity_label=final_severity_label,
        latitude=latitude,
        longitude=longitude,
        ai_summary=verification.ai_summary,
        safety_note=verification.safety_note,
        timestamp=now_utc,
    )

    # Commit happens automatically via the `get_db` dependency on success
    logger.info("✅ Report %s ingested successfully. Telegram=%s", report_id, telegram_ok)

    # ── Step 6: Return response ───────────────────────────────────────────────
    return orm_to_response(
        new_report,
        duplicate_info=duplicate_info,
        telegram_dispatched=telegram_ok,
    )


# ─── GET /api/reports ─────────────────────────────────────────────────────────

@app.get(
    "/api/reports",
    response_model=List[ReportResponse],
    tags=["Reports"],
    summary="Retrieve all hazard reports",
)
async def list_reports(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Return the full list of hazard reports ordered newest-first.

    Optional query parameters:
      - `status_filter` : Filter by status  (Pending | Dispatched | Resolved)
      - `category`      : Filter by category (Disaster | Road | Utilities | Medical)

    Example:
        GET /api/reports?status_filter=Pending&category=Disaster
    """
    query = select(HazardReport).order_by(HazardReport.timestamp.desc())

    if status_filter:
        query = query.where(HazardReport.status == status_filter)
    if category:
        query = query.where(HazardReport.category == category)

    result = await db.execute(query)
    reports: List[HazardReport] = list(result.scalars().all())

    return [orm_to_response(r) for r in reports]


# ─── PATCH /api/reports/{report_id}/status ───────────────────────────────────

@app.patch(
    "/api/reports/{report_id}/status",
    response_model=ReportResponse,
    tags=["Reports"],
    summary="Update incident lifecycle status",
)
async def update_report_status(
    report_id: str,
    body: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Transition a hazard report's lifecycle status.

    Allowed transitions:
        Pending → Dispatched → Resolved

    The frontend dashboard "Resolve" and "Dispatch" action buttons call this endpoint.
    """
    result = await db.execute(
        select(HazardReport).where(HazardReport.id == report_id)
    )
    report: Optional[HazardReport] = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id!r} not found.",
        )

    old_status = report.status
    report.status = body.status
    report.updated_at = datetime.now(timezone.utc)
    await db.flush()

    logger.info(
        "Report %s status updated: %s → %s", report_id, old_status, body.status
    )
    return orm_to_response(report)
