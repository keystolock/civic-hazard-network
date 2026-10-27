"""
services/telegram_service.py — Telegram Bot alert dispatcher
=============================================================
Sends a structured emergency alert message to a Telegram chat / channel
whenever a new hazard report is ingested and verified.

Message format (Markdown):
    🚨 *CIVIC HAZARD ALERT* 🚨
    ──────────────────────────
    📋 *Title:*   Flash flood submerging ITO underpass
    🏷️ *Category:* Disaster | 🔴 Extreme
    📍 *Location:* 28.6310°N, 77.2167°E
    🤖 *AI Summary:* Severe flash flood blocking all four lanes.
    🛡️ *Safety Note:* Avoid area. Use Ring Road alternate route.
    🕐 *Reported:* 2026-10-20 20:55 UTC
    ──────────────────────────

Inline keyboard buttons:
    [ ✅ Accept & Dispatch ]   [ 🗺 View on Live Map ]

Uses httpx for async HTTP calls so the FastAPI route handler never blocks.

Graceful degradation: if TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID are not
configured, the function logs a warning and returns False instead of raising.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from html import escape
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}/{method}"

# ─── Severity emoji mapping ───────────────────────────────────────────────────

_SEVERITY_EMOJI: dict[str, str] = {
    "extreme": "🔴",
    "severe":  "🟠",
    "civic":   "🟡",
}


def _fmt_timestamp(ts: Optional[datetime] = None) -> str:
    """Return a human-readable UTC timestamp string."""
    dt = ts or datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%d %H:%M UTC")


def _build_alert_message(
    report_id: str,
    title: str,
    category: str,
    severity_label: str,
    latitude: float,
    longitude: float,
    ai_summary: Optional[str],
    safety_note: Optional[str],
    timestamp: Optional[datetime] = None,
) -> str:
    """
    Compose the Telegram alert message body using MarkdownV2 formatting.

    MarkdownV2 requires escaping many special characters.  We keep the text
    simple to avoid escaping hell — use HTML parse_mode instead for rich text.
    """
    sev_emoji = _SEVERITY_EMOJI.get(severity_label, "⚪")
    sev_text = escape(severity_label.upper())
    title_text = escape(title)
    category_text = escape(category)
    summary = escape(ai_summary or "No AI summary available.")
    safety = escape(safety_note or "Exercise caution near the reported area.")
    ts_str = _fmt_timestamp(timestamp)
    lat_direction = "N" if latitude >= 0 else "S"
    lon_direction = "E" if longitude >= 0 else "W"

    lines = [
        "🚨 <b>CIVIC HAZARD ALERT</b> 🚨",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        f"📋 <b>Title:</b>   {title_text}",
        f"🏷️ <b>Category:</b> {category_text}  |  {sev_emoji} <b>{sev_text}</b>",
        f"📍 <b>Location:</b> {abs(latitude):.4f}°{lat_direction}, "
        f"{abs(longitude):.4f}°{lon_direction}",
        f"🤖 <b>AI Summary:</b> {summary}",
        f"🛡️ <b>Safety Note:</b> {safety}",
        f"🕐 <b>Reported:</b> {ts_str}",
        "━━━━━━━━━━━━━━━━━━━━━━━━",
        f"<i>Report ID: {report_id}</i>",
    ]
    return "\n".join(lines)


def _build_inline_keyboard(report_id: str, latitude: float, longitude: float) -> dict:
    """
    Build the Telegram InlineKeyboardMarkup with two action buttons:
        1. ✅ Accept & Dispatch  → callback_data for bot webhook handler
        2. 🗺 View on Live Map   → opens the frontend map with the report selected
    """
    # The frontend deep-link URL — points to the dashboard map centered on this report
    map_url = f"http://localhost:3000/dashboard?report={report_id}"

    return {
        "inline_keyboard": [
            [
                {
                    "text": "✅ Accept & Dispatch",
                    "callback_data": f"dispatch:{report_id}",
                },
                {
                    "text": "🗺 View on Live Map",
                    "url": map_url,
                },
            ]
        ]
    }


async def dispatch_telegram_alert(
    report_id: str,
    title: str,
    category: str,
    severity_label: str,
    latitude: float,
    longitude: float,
    ai_summary: Optional[str] = None,
    safety_note: Optional[str] = None,
    timestamp: Optional[datetime] = None,
) -> bool:
    """
    Send a structured Telegram alert with inline action buttons to the configured
    emergency responder chat.

    Parameters
    ----------
    report_id      : str    Unique ID of the newly created hazard report.
    title          : str    Short incident headline.
    category       : str    Incident category (Disaster / Road / Utilities / Medical).
    severity_label : str    AI-assigned severity label (civic / severe / extreme).
    latitude       : float  WGS-84 latitude of the incident.
    longitude      : float  WGS-84 longitude of the incident.
    ai_summary     : str    One-line Gemini AI summary (optional).
    safety_note    : str    AI-generated safety instruction (optional).
    timestamp      : datetime | None  Report creation time (defaults to now).

    Returns
    -------
    bool
        True if the Telegram API call returned HTTP 200 OK, False otherwise.
    """

    # ── Guard: check credentials are configured ───────────────────────────────
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if token in ("YOUR_TELEGRAM_BOT_TOKEN_HERE", "", None):
        logger.warning(
            "TELEGRAM_BOT_TOKEN not configured — skipping alert for report %s", report_id
        )
        return False

    if chat_id in ("YOUR_TELEGRAM_CHAT_ID_HERE", "", None):
        logger.warning(
            "TELEGRAM_CHAT_ID not configured — skipping alert for report %s", report_id
        )
        return False

    # ── Build message and keyboard ────────────────────────────────────────────
    text = _build_alert_message(
        report_id=report_id,
        title=title,
        category=category,
        severity_label=severity_label,
        latitude=latitude,
        longitude=longitude,
        ai_summary=ai_summary,
        safety_note=safety_note,
        timestamp=timestamp,
    )
    reply_markup = _build_inline_keyboard(report_id, latitude, longitude)

    url = TELEGRAM_API_BASE.format(token=token, method="sendMessage")
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": reply_markup,
        "disable_web_page_preview": True,
    }

    # ── Async HTTP POST to Telegram ───────────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info(
                "✅ Telegram alert dispatched for report %s → chat %s", report_id, chat_id
            )
            return True

    except httpx.HTTPStatusError as exc:
        logger.error(
            "Telegram API HTTP error %s for report %s: %s",
            exc.response.status_code, report_id, exc.response.text,
        )
        return False

    except httpx.RequestError as exc:
        logger.error(
            "Telegram network error for report %s: %s", report_id, exc
        )
        return False

    except Exception as exc:
        logger.error(
            "Unexpected Telegram error for report %s: %s", report_id, exc, exc_info=True
        )
        return False
