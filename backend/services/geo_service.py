"""
services/geo_service.py — Haversine distance + perceptual image hash deduplication
====================================================================================
Two independent deduplication layers run in sequence:

Layer 1 — Spatial (Haversine):
    Checks whether any existing open report exists within DEDUP_RADIUS_METERS
    (default 250 m) of the incoming GPS coordinates.

Layer 2 — Perceptual Image Hash (pHash):
    If an image was uploaded, computes its 64-bit perceptual hash (using imagehash)
    and compares it against hashes of existing reports.  A Hamming distance below
    DEDUP_IMAGE_HASH_THRESHOLD (default 10 bits) flags the image as near-duplicate.

Both layers are needed together because two reporters at the same pothole may
upload completely different photos, and two identical photos may be submitted from
different streets (e.g. stock imagery).

Public API:
    compute_image_hash(image_bytes)              → str | None
    haversine_distance_m(lat1, lon1, lat2, lon2) → float
    check_duplicates(new_report, existing_reports, new_image_bytes) → DuplicateCheckResult
"""

from __future__ import annotations

import io
import logging
import math
from dataclasses import dataclass
from typing import List, Optional

from config import settings
from models import DuplicateInfo, HazardReport

logger = logging.getLogger(__name__)


# ─── Haversine formula ────────────────────────────────────────────────────────

_EARTH_RADIUS_M = 6_371_000.0   # metres


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance in metres between two WGS-84 points
    using the Haversine formula.

    Parameters
    ----------
    lat1, lon1 : float  First point latitude / longitude in decimal degrees.
    lat2, lon2 : float  Second point latitude / longitude in decimal degrees.

    Returns
    -------
    float   Distance in metres.
    """
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)

    a = math.sin(Δφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return _EARTH_RADIUS_M * c


# ─── Perceptual image hashing ─────────────────────────────────────────────────

def compute_image_hash(image_bytes: bytes) -> Optional[str]:
    """
    Compute the perceptual hash (pHash) of an image.

    Returns the 64-bit hex string of the pHash, or None if the image cannot
    be decoded (e.g. the upload is corrupt or not an image).

    pHash is robust to minor JPEG re-encoding, resizing, and brightness changes —
    meaning two photos of the same pothole taken 5 seconds apart will still be
    considered duplicates even if compressed differently.
    """
    try:
        import imagehash
        from PIL import Image

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return str(imagehash.phash(img))
    except Exception as exc:
        logger.warning("Failed to compute image hash: %s", exc)
        return None


def _image_similarity(hash_a: str, hash_b: str) -> float:
    """
    Convert Hamming distance between two pHash strings to a similarity score
    in the range [0.0, 1.0] (1.0 = identical, 0.0 = completely different).

    A 64-bit pHash has a maximum Hamming distance of 64.
    """
    try:
        import imagehash

        a = imagehash.hex_to_hash(hash_a)
        b = imagehash.hex_to_hash(hash_b)
        hamming = a - b          # Returns integer bit-distance
        return 1.0 - (hamming / 64.0)
    except Exception:
        return 0.0


# ─── Combined deduplication check ────────────────────────────────────────────

@dataclass
class DuplicateCheckResult:
    """Internal result dataclass wrapping both dedup layers."""
    is_duplicate: bool
    matched_id: Optional[str]
    distance_m: Optional[float]
    image_similarity: Optional[float]
    new_image_hash: Optional[str]


def check_duplicates(
    new_lat: float,
    new_lon: float,
    new_image_bytes: Optional[bytes],
    existing_reports: List[HazardReport],
) -> DuplicateCheckResult:
    """
    Run both deduplication layers and return a combined result.

    The algorithm:
    1. Compute the pHash of the new image (if provided).
    2. For each existing open report (status != "Resolved"):
        a. Calculate Haversine distance.  If within DEDUP_RADIUS_METERS:
             - Also check image similarity if both reports have hashes.
             - If spatial hit alone → duplicate.
             - Spatial hit + similar image → duplicate (higher confidence).
        b. If no spatial hit but image hashes are nearly identical → duplicate.

    Parameters
    ----------
    new_lat, new_lon   : float       Coordinates of the incoming report.
    new_image_bytes    : bytes | None  Raw bytes of the uploaded image, or None.
    existing_reports   : list         ORM rows of all active reports from the DB.

    Returns
    -------
    DuplicateCheckResult
    """
    new_hash: Optional[str] = None
    if new_image_bytes:
        new_hash = compute_image_hash(new_image_bytes)
        logger.debug("Computed pHash for incoming image: %s", new_hash)

    radius = settings.DEDUP_RADIUS_METERS
    hash_threshold = settings.DEDUP_IMAGE_HASH_THRESHOLD

    best_match_id: Optional[str] = None
    best_distance: Optional[float] = None
    best_image_sim: Optional[float] = None
    is_duplicate = False

    for report in existing_reports:
        if report.status == "Resolved":
            continue   # Resolved reports are out of scope for dedup

        # ── Layer 1: Spatial check ────────────────────────────────────────────
        dist = haversine_distance_m(new_lat, new_lon, report.latitude, report.longitude)
        spatial_hit = dist <= radius

        # ── Layer 2: Image hash check ─────────────────────────────────────────
        img_sim: Optional[float] = None
        image_hit = False
        if new_hash and report.image_hash:
            img_sim = _image_similarity(new_hash, report.image_hash)
            # Hamming distance equivalent: (1 - sim) * 64
            hamming = int((1.0 - img_sim) * 64)
            image_hit = hamming <= hash_threshold
            logger.debug(
                "Image similarity with %s: %.2f (hamming %d, threshold %d)",
                report.id, img_sim, hamming, hash_threshold,
            )

        if spatial_hit or image_hit:
            # Prefer the closest spatial match if multiple candidates found
            if best_distance is None or dist < best_distance:
                is_duplicate = True
                best_match_id = report.id
                best_distance = dist
                best_image_sim = img_sim
                logger.info(
                    "Duplicate detected — existing report %s is %.1f m away "
                    "(spatial=%s, image_hit=%s)",
                    report.id, dist, spatial_hit, image_hit,
                )

    return DuplicateCheckResult(
        is_duplicate=is_duplicate,
        matched_id=best_match_id,
        distance_m=round(best_distance, 1) if best_distance is not None else None,
        image_similarity=round(best_image_sim, 3) if best_image_sim is not None else None,
        new_image_hash=new_hash,
    )
