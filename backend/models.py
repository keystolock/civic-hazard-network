"""
models.py — Pydantic v2 schemas and SQLAlchemy ORM models
==========================================================
Contains:
    • SQLAlchemy ORM: HazardReport (the database table)
    • Pydantic v2 Input schemas: ReportCreateForm, StatusUpdateRequest
    • Pydantic v2 Output schemas: ReportResponse, DuplicateInfo, VerificationResult

All timestamps are stored and returned as ISO-8601 UTC strings.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase


# ─── SQLAlchemy Base ──────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """Common declarative base shared by all ORM models."""
    pass


# ─── ORM Model ───────────────────────────────────────────────────────────────

class HazardReport(Base):
    """Database table that stores each verified hazard report."""

    __tablename__ = "hazard_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), nullable=False)          # e.g. Disaster / Road / Utilities / Medical

    # Coordinates (WGS-84)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Severity derived by Gemini (1=civic, 2=civic+, 3=severe, 4=severe+, 5=extreme)
    severity = Column(Integer, nullable=False, default=1)
    # Human-readable label mapped from integer severity
    severity_label = Column(String(32), nullable=False, default="civic")

    # Gemini AI outputs
    ai_summary = Column(Text, nullable=True)              # One-line AI-generated summary
    ai_verified = Column(Integer, nullable=False, default=0)  # 0=unverified, 1=verified
    safety_note = Column(Text, nullable=True)             # AI safety / evacuation advice

    # Storage
    image_url = Column(String(512), nullable=True)        # Relative path under UPLOAD_DIR
    image_hash = Column(String(128), nullable=True)       # Perceptual hash for dedup

    # Lifecycle
    status = Column(
        String(32),
        nullable=False,
        default="Pending",
    )  # Pending | Dispatched | Resolved

    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Reporter reference (optional future expansion)
    reporter_id = Column(String(128), nullable=True)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

SeverityLabel = Literal["civic", "severe", "extreme"]
StatusLabel = Literal["Pending", "Dispatched", "Resolved"]
CategoryLabel = Literal["Disaster", "Road", "Utilities", "Medical", "Other"]


class ReportCreateForm(BaseModel):
    """Schema for the multipart form fields submitted by the Next.js frontend."""

    title: str = Field(..., min_length=5, max_length=255, description="Short incident headline")
    description: Optional[str] = Field(None, max_length=2000, description="Extended description")
    category: CategoryLabel = Field(..., description="Incident category")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS-84 latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS-84 longitude")
    severity: SeverityLabel = Field("civic", description="Self-reported severity hint")
    reporter_id: Optional[str] = Field(None, description="Anonymous device fingerprint")

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("title must not be blank")
        return v.strip()


class StatusUpdateRequest(BaseModel):
    """Payload accepted by PATCH /api/reports/{id}/status."""

    status: StatusLabel = Field(..., description="New lifecycle status")


class DuplicateInfo(BaseModel):
    """Returned inside ReportResponse when a near-duplicate was detected."""

    is_duplicate: bool = False
    matched_report_id: Optional[str] = None
    distance_meters: Optional[float] = None
    image_similarity: Optional[float] = None   # 0.0 (different) — 1.0 (identical)


class VerificationResult(BaseModel):
    """Structured output from the Gemini AI verification step."""

    ai_verified: bool = False
    ai_summary: str = "Unverified — AI check skipped"
    safety_note: Optional[str] = None
    severity_score: int = Field(1, ge=1, le=5)   # 1–5 integer scale
    severity_label: SeverityLabel = "civic"       # mapped label
    rejection_reason: Optional[str] = None        # set if ai_verified is False


class ReportResponse(BaseModel):
    """Full report object returned by POST and GET /api/reports endpoints."""

    id: str
    title: str
    description: Optional[str] = None
    category: str
    latitude: float
    longitude: float
    severity: int
    severity_label: str
    ai_summary: Optional[str] = None
    ai_verified: bool = False
    safety_note: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    timestamp: str             # ISO-8601 UTC
    duplicate_info: Optional[DuplicateInfo] = None
    telegram_dispatched: bool = False

    model_config = {"from_attributes": True}


def orm_to_response(report: HazardReport, **kwargs) -> ReportResponse:
    """Convert an ORM HazardReport row to a ReportResponse Pydantic model."""
    ts = report.timestamp
    iso_ts = ts.isoformat() if ts else datetime.now(timezone.utc).isoformat()

    return ReportResponse(
        id=report.id,
        title=report.title,
        description=report.description,
        category=report.category,
        latitude=report.latitude,
        longitude=report.longitude,
        severity=report.severity,
        severity_label=report.severity_label,
        ai_summary=report.ai_summary,
        ai_verified=bool(report.ai_verified),
        safety_note=report.safety_note,
        image_url=report.image_url,
        status=report.status,
        timestamp=iso_ts,
        **kwargs,
    )
