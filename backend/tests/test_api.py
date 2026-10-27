"""
tests/test_api.py — FastAPI endpoint integration tests (no real credentials needed)
=====================================================================================
Uses httpx.AsyncClient with the ASGI transport so every test runs in-process
against a real SQLite test database — zero network calls, zero API keys.

Requires:
    pip install pytest pytest-asyncio httpx

Run with:
    pytest tests/test_api.py -v --asyncio-mode=auto
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Override settings BEFORE importing the app so the test DB is used
import os
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_civic.db")
os.environ.setdefault("AI_VERIFICATION_ENABLED", "False")   # Skip real Gemini calls
os.environ.setdefault("TELEGRAM_BOT_TOKEN", "TEST_TOKEN")
os.environ.setdefault("TELEGRAM_CHAT_ID", "TEST_CHAT")

from main import app
from database import engine, init_db
from models import Base


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Create tables in the test SQLite DB once per session, then drop them."""
    await init_db()
    yield
    # Teardown: drop all test tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    """Yield an async test client wired to the FastAPI ASGI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as c:
        yield c


# ─── Health check ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    r = await client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "timestamp" in body


# ─── GET /api/reports (empty) ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_reports_empty(client: AsyncClient):
    r = await client.get("/api/reports")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ─── POST /api/reports ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_report_no_image(client: AsyncClient):
    """Submit a report without an image — should succeed with AI disabled."""
    r = await client.post(
        "/api/reports",
        data={
            "title": "Large pothole blocking cycle lane on Ring Road",
            "description": "Approximately 40cm diameter, 8cm deep",
            "category": "Road",
            "latitude": "28.6310",
            "longitude": "77.2167",
            "severity": "civic",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["title"] == "Large pothole blocking cycle lane on Ring Road"
    assert body["category"] == "Road"
    assert "id" in body
    assert body["status"] == "Pending"


@pytest.mark.asyncio
async def test_create_report_rejects_invalid_category_and_severity(client: AsyncClient):
    payload = {
        "title": "Invalid report category",
        "category": "Unknown",
        "latitude": "28.6310",
        "longitude": "77.2167",
        "severity": "urgent",
    }
    response = await client.post("/api/reports", data=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_report_rejects_out_of_range_title(client: AsyncClient):
    response = await client.post(
        "/api/reports",
        data={
            "title": "x" * 256,
            "category": "Road",
            "latitude": "28.6310",
            "longitude": "77.2167",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_report_rejects_whitespace_title(client: AsyncClient):
    response = await client.post(
        "/api/reports",
        data={
            "title": "     ",
            "category": "Road",
            "latitude": "28.6310",
            "longitude": "77.2167",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_report_returns_duplicate_info(client: AsyncClient):
    """Second nearby report should be flagged as a duplicate."""
    payload = {
        "title": "Water main burst near Lajpat Nagar metro",
        "category": "Utilities",
        "latitude": "28.5700",
        "longitude": "77.2430",
        "severity": "severe",
    }
    # First submission
    r1 = await client.post("/api/reports", data=payload)
    assert r1.status_code == 201

    # Second nearby submission (same coords → definitely within 250 m)
    r2 = await client.post("/api/reports", data=payload)
    assert r2.status_code == 201
    body2 = r2.json()
    assert body2["duplicate_info"]["is_duplicate"] is True


# ─── GET /api/reports (populated) ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_reports_populated(client: AsyncClient):
    r = await client.get("/api/reports")
    assert r.status_code == 200
    reports = r.json()
    assert len(reports) >= 1
    # Every report should have mandatory fields
    for rep in reports:
        assert "id" in rep
        assert "latitude" in rep
        assert "longitude" in rep
        assert "status" in rep


# ─── PATCH /api/reports/{id}/status ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_update_status(client: AsyncClient):
    # Create a report
    r = await client.post(
        "/api/reports",
        data={
            "title": "Fallen tree blocking Mathura Road near Ashram",
            "category": "Disaster",
            "latitude": "28.5950",
            "longitude": "77.2510",
            "severity": "severe",
        },
    )
    assert r.status_code == 201
    report_id = r.json()["id"]

    # Update its status to Dispatched
    patch = await client.patch(
        f"/api/reports/{report_id}/status",
        json={"status": "Dispatched"},
    )
    assert patch.status_code == 200
    assert patch.json()["status"] == "Dispatched"

    # Update to Resolved
    patch2 = await client.patch(
        f"/api/reports/{report_id}/status",
        json={"status": "Resolved"},
    )
    assert patch2.status_code == 200
    assert patch2.json()["status"] == "Resolved"


@pytest.mark.asyncio
async def test_update_nonexistent_report_returns_404(client: AsyncClient):
    r = await client.patch(
        "/api/reports/nonexistent-id-xyz/status",
        json={"status": "Dispatched"},
    )
    assert r.status_code == 404
