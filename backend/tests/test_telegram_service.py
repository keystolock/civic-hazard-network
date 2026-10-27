from datetime import datetime, timezone

from services.telegram_service import _build_alert_message


def test_alert_message_escapes_html_and_formats_southern_western_coordinates():
    message = _build_alert_message(
        report_id="report-1",
        title="Flood <urgent> & danger",
        category="Road & Utilities",
        severity_label="severe",
        latitude=-33.8688,
        longitude=-151.2093,
        ai_summary="Water < 1m",
        safety_note="Avoid & evacuate",
        timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )

    assert "Flood &lt;urgent&gt; &amp; danger" in message
    assert "Road &amp; Utilities" in message
    assert "Water &lt; 1m" in message
    assert "Avoid &amp; evacuate" in message
    assert "33.8688°S, 151.2093°W" in message
