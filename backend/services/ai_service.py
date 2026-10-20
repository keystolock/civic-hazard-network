"""
services/ai_service.py — Gemini 2.5 Flash multimodal hazard verification
=========================================================================
Responsibilities:
    1. Upload the hazard photo bytes to the Gemini Files API (handles large images).
    2. Send a structured prompt requesting JSON output for:
         - authenticity verdict  (is this a real civic hazard?)
         - one-line AI summary
         - severity integer score (1–5)
         - safety / evacuation instructions
    3. Parse the model's JSON response and return a VerificationResult.
    4. Gracefully fall back to an "unverified" stub when:
         - AI_VERIFICATION_ENABLED is False (dev mode)
         - No image was provided
         - The Gemini API call fails for any reason

Severity mapping:
    1  → civic    (minor pothole, garbage)
    2  → civic    (larger civic nuisance)
    3  → severe   (road collapse, gas leak)
    4  → severe   (immediate danger)
    5  → extreme  (life-threatening — flood, landslide)
"""

from __future__ import annotations

import io
import json
import logging
import re
from typing import Optional

from config import settings
from models import VerificationResult

logger = logging.getLogger(__name__)

# ─── Severity helpers ─────────────────────────────────────────────────────────

SEVERITY_LABEL_MAP: dict[int, str] = {
    1: "civic",
    2: "civic",
    3: "severe",
    4: "severe",
    5: "extreme",
}


def _score_to_label(score: int) -> str:
    return SEVERITY_LABEL_MAP.get(max(1, min(score, 5)), "civic")


# ─── Prompt template ─────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are an AI safety analyst for the Civic Hazard Network emergency dispatch system.
Your task is to assess a user-submitted hazard photo and incident description.

Respond ONLY with a single valid JSON object — no markdown, no extra text.
The JSON must contain exactly these keys:

{
  "verified": <true | false>,
  "summary": "<one concise sentence describing the hazard — max 20 words>",
  "severity_score": <integer 1 to 5>,
  "safety_note": "<brief public safety / evacuation advice — max 30 words>",
  "rejection_reason": "<null or reason why the image does not show a real hazard>"
}

Severity scoring guide:
  1 = Minor civic nuisance (small pothole, litter)
  2 = Moderate civic issue (large pothole, broken utility)
  3 = Severe hazard (road collapse, live downed wire, flooding street)
  4 = Very severe (gas leak, multiple casualties risk, bridge damage)
  5 = Extreme / life-threatening emergency (flash flood, landslide, building collapse)

Mark verified=false if:
  - The image is clearly unrelated to a civic or natural hazard
  - The image appears AI-generated or is a stock photo
  - The image contains no discernible hazard
"""


def _build_user_prompt(title: str, description: Optional[str], category: str) -> str:
    parts = [
        f"Incident title: {title}",
        f"Category: {category}",
    ]
    if description:
        parts.append(f"Reporter description: {description}")
    parts.append("Please analyse the attached image and return the JSON assessment.")
    return "\n".join(parts)


# ─── Fallback result ─────────────────────────────────────────────────────────

def _unverified_fallback(reason: str = "AI verification skipped") -> VerificationResult:
    return VerificationResult(
        ai_verified=False,
        ai_summary="Awaiting AI verification",
        safety_note="Exercise caution near the reported area.",
        severity_score=1,
        severity_label="civic",
        rejection_reason=reason,
    )


# ─── JSON extractor ──────────────────────────────────────────────────────────

def _extract_json(raw: str) -> dict:
    """
    Robustly extract the first JSON object from the model response,
    even when the model wraps it in markdown code fences.
    """
    # Strip markdown fences if present
    cleaned = re.sub(r"```(?:json)?", "", raw, flags=re.IGNORECASE).strip()
    # Find the first { ... } block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in model response:\n{raw[:300]}")
    return json.loads(match.group())


# ─── Main verification function ──────────────────────────────────────────────

async def verify_hazard_with_gemini(
    image_bytes: Optional[bytes],
    image_mime: str,
    title: str,
    description: Optional[str],
    category: str,
) -> VerificationResult:
    """
    Submit the hazard photo + metadata to Gemini 2.5 Flash for multimodal analysis.

    Parameters
    ----------
    image_bytes : bytes | None
        Raw binary content of the uploaded image. Pass None to skip AI image analysis.
    image_mime  : str
        MIME type of the image (e.g. "image/jpeg", "image/png").
    title       : str
        Short headline provided by the reporter.
    description : str | None
        Extended description (optional).
    category    : str
        Incident category (Disaster / Road / Utilities / Medical / Other).

    Returns
    -------
    VerificationResult
        Structured Pydantic object containing the AI verdict and metadata.
    """

    # ── Short-circuit when AI is disabled in dev mode ─────────────────────────
    if not settings.AI_VERIFICATION_ENABLED:
        logger.info("AI verification disabled — returning stub result")
        return _unverified_fallback("AI_VERIFICATION_ENABLED=False in config")

    # ── Short-circuit when no API key is configured ───────────────────────────
    if settings.GEMINI_API_KEY in ("YOUR_API_KEY_HERE", "", None):
        logger.warning("GEMINI_API_KEY not configured — returning unverified stub")
        return _unverified_fallback("GEMINI_API_KEY not set in environment")

    try:
        # Lazy import so the server starts even without a valid key for testing
        from google import genai
        from google.genai import types as genai_types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        model_id = "gemini-2.5-flash"

        user_text = _build_user_prompt(title, description, category)

        # ── Build content parts ───────────────────────────────────────────────
        if image_bytes:
            logger.info(
                "Uploading %d bytes (%s) to Gemini Files API…", len(image_bytes), image_mime
            )
            # Use the inline data approach for images ≤ 20 MB (fine for most uploads)
            image_part = genai_types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime,
            )
            contents = [
                genai_types.Content(
                    role="user",
                    parts=[image_part, genai_types.Part.from_text(user_text)],
                )
            ]
        else:
            # Text-only path — no image uploaded
            contents = [
                genai_types.Content(
                    role="user",
                    parts=[genai_types.Part.from_text(user_text)],
                )
            ]

        # ── Gemini API call ───────────────────────────────────────────────────
        response = client.models.generate_content(
            model=model_id,
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,     # Low temperature for deterministic structured output
                max_output_tokens=512,
            ),
        )

        raw_text: str = response.text or ""
        logger.debug("Gemini raw response: %s", raw_text[:500])

        # ── Parse JSON ────────────────────────────────────────────────────────
        data = _extract_json(raw_text)

        verified: bool = bool(data.get("verified", False))
        summary: str = str(data.get("summary", "Hazard detected")).strip()
        score: int = max(1, min(int(data.get("severity_score", 1)), 5))
        safety_note: Optional[str] = data.get("safety_note")
        rejection_reason: Optional[str] = data.get("rejection_reason")

        return VerificationResult(
            ai_verified=verified,
            ai_summary=summary,
            safety_note=safety_note,
            severity_score=score,
            severity_label=_score_to_label(score),
            rejection_reason=rejection_reason if not verified else None,
        )

    except Exception as exc:
        logger.error("Gemini verification failed: %s", exc, exc_info=True)
        return _unverified_fallback(f"Gemini API error: {type(exc).__name__}")
