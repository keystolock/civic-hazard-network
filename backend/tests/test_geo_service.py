"""
tests/test_geo_service.py — Unit tests for Haversine distance + deduplication logic
=====================================================================================
These tests run without any external API keys or database connections.
Run with:  pytest tests/ -v
"""

import pytest

from services.geo_service import (
    DuplicateCheckResult,
    check_duplicates,
    compute_image_hash,
    haversine_distance_m,
)


# ─── Haversine tests ──────────────────────────────────────────────────────────

class TestHaversine:
    """Validate the Haversine distance calculation against known geodetic values."""

    def test_same_point_is_zero(self):
        """Distance from a point to itself must be 0."""
        d = haversine_distance_m(28.6139, 77.2090, 28.6139, 77.2090)
        assert d == pytest.approx(0.0, abs=0.01)

    def test_connaught_place_to_india_gate(self):
        """
        Connaught Place (28.6310°N, 77.2167°E) to India Gate (28.6129°N, 77.2295°E)
        is approximately 2,450 m — validate within ±100 m.
        """
        d = haversine_distance_m(28.6310, 77.2167, 28.6129, 77.2295)
        assert 2_300 < d < 2_600, f"Unexpected distance: {d:.0f} m"

    def test_within_250m_threshold(self):
        """Two points 180 m apart should be flagged as within the dedup radius."""
        # ~180 m north of origin
        d = haversine_distance_m(28.6310, 77.2167, 28.6326, 77.2167)
        assert d < 250.0

    def test_outside_250m_threshold(self):
        """Two points 600 m apart should NOT be flagged as duplicates."""
        # ~600 m north of origin
        d = haversine_distance_m(28.6310, 77.2167, 28.6364, 77.2167)
        assert d > 250.0


# ─── check_duplicates tests ───────────────────────────────────────────────────

class FakeReport:
    """Minimal stub that mimics a HazardReport ORM row for dedup tests."""

    def __init__(self, id_, lat, lon, status="Pending", image_hash=None):
        self.id = id_
        self.latitude = lat
        self.longitude = lon
        self.status = status
        self.image_hash = image_hash


class TestCheckDuplicates:

    def test_no_existing_reports_is_not_duplicate(self):
        result = check_duplicates(28.6310, 77.2167, None, [])
        assert result.is_duplicate is False
        assert result.matched_id is None

    def test_nearby_report_is_duplicate(self):
        existing = [FakeReport("abc-123", 28.6318, 77.2167)]   # ~90 m away
        result = check_duplicates(28.6310, 77.2167, None, existing)
        assert result.is_duplicate is True
        assert result.matched_id == "abc-123"
        assert result.distance_m < 250.0

    def test_far_report_is_not_duplicate(self):
        existing = [FakeReport("far-report", 28.6500, 77.2167)]   # >2 km away
        result = check_duplicates(28.6310, 77.2167, None, existing)
        assert result.is_duplicate is False

    def test_resolved_report_excluded_from_dedup(self):
        """Resolved reports should NOT trigger the dedup flag."""
        existing = [FakeReport("resolved-1", 28.6318, 77.2167, status="Resolved")]
        result = check_duplicates(28.6310, 77.2167, None, existing)
        assert result.is_duplicate is False

    def test_closest_match_selected(self):
        """When multiple reports are within radius, the closest is selected."""
        reports = [
            FakeReport("close", 28.6313, 77.2167),   # ~33 m away
            FakeReport("medium", 28.6320, 77.2167),  # ~110 m away
        ]
        result = check_duplicates(28.6310, 77.2167, None, reports)
        assert result.is_duplicate is True
        assert result.matched_id == "close"


# ─── compute_image_hash tests ─────────────────────────────────────────────────

class TestComputeImageHash:

    def test_returns_none_for_invalid_bytes(self):
        """Corrupted bytes should not raise — should return None gracefully."""
        result = compute_image_hash(b"not an image at all !@#$%")
        assert result is None

    def test_valid_image_returns_hex_string(self):
        """A programmatically generated PNG should produce a hex pHash string."""
        import io
        from PIL import Image

        # Create a genuine 64×64 solid red image and save it as PNG in-memory
        img = Image.new("RGB", (64, 64), color=(220, 38, 38))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        valid_png = buf.getvalue()

        h = compute_image_hash(valid_png)
        assert h is not None, "Expected a pHash string, got None"
        assert isinstance(h, str)
        assert len(h) > 0
