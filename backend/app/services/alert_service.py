import datetime
from typing import List
from app.models.schemas import WeatherAlert


class AlertService:
    """
    Early Warning Alert Service.
    Distributes severe thunderstorm, lightning hazard, and squall warnings adhering to CAP-1.2.
    """

    def get_active_alerts(self, lat: float = 28.6139, lon: float = 77.2090) -> List[WeatherAlert]:
        """Returns currently active georeferenced severe weather alerts."""
        now = datetime.datetime.utcnow()
        return [
            WeatherAlert(
                alert_id="CAP-IN-IMD-2026-0929-001",
                severity="EXTREME",
                event_type="LIGHTNING_AND_SQUALL",
                headline="RED ALERT: Severe Thunderstorm with Intense Lightning & Squall (>70 km/h)",
                description=(
                    "Doppler Weather Radar and Satellite Nowcasting models indicate intense convective clusters "
                    "approaching NCR region with cloud top reflectivity >55 dBZ and extreme cloud-to-ground lightning risk."
                ),
                instruction="Seek immediate sturdy shelter. Stay away from open fields, tall trees, power lines, and water bodies.",
                area_desc="Delhi NCR, Noida, Ghaziabad, Gurugram, Faridabad",
                polygon_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [76.85, 28.35],
                        [77.45, 28.35],
                        [77.50, 28.85],
                        [76.80, 28.85],
                        [76.85, 28.35]
                    ]]
                },
                onset=now - datetime.timedelta(minutes=15),
                expires=now + datetime.timedelta(hours=2),
                is_active=True
            ),
            WeatherAlert(
                alert_id="CAP-IN-IMD-2026-0929-002",
                severity="SEVERE",
                event_type="HEAVY_PRECIPITATION",
                headline="ORANGE WARNING: Intense Cloudburst-like Downpour Expected",
                description="Localized rain rates exceeding 45 mm/hr detected along storm track vectors for next 60 minutes.",
                instruction="Avoid waterlogged underpasses and low-lying roadways.",
                area_desc="East Delhi & Western Uttar Pradesh Border",
                polygon_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [77.25, 28.55],
                        [77.60, 28.55],
                        [77.60, 28.90],
                        [77.25, 28.90],
                        [77.25, 28.55]
                    ]]
                },
                onset=now,
                expires=now + datetime.timedelta(hours=1, minutes=30),
                is_active=True
            )
        ]


alert_service = AlertService()
