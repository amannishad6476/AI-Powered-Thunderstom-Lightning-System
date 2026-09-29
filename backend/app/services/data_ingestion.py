import datetime
from typing import List, Dict, Any
from app.models.schemas import StationObservation, RadarFrameResponse


class DataIngestionService:
    """
    Ingestion and preprocessing service for Doppler Weather Radars (DWR),
    INSAT-3D/3DR / Kalpana satellite feeds, and Automatic Weather Stations.
    """

    def get_active_radar_frames(self, radar_code: str = "DELHI_DWR") -> List[RadarFrameResponse]:
        """Returns radar volume scans and projected nowcast frames."""
        now = datetime.datetime.utcnow()
        frames = []

        # Past 3 observed frames (-30m, -20m, -10m, 0m)
        for offset in [-30, -20, -10, 0]:
            frames.append(
                RadarFrameResponse(
                    frame_id=f"{radar_code}_OBS_{abs(offset)}M_AGO",
                    timestamp=now + datetime.timedelta(minutes=offset),
                    radar_station=radar_code,
                    product_type="MAX_DBZ",
                    bounds=[[28.0, 76.5], [29.2, 77.8]],
                    image_url=f"/api/v1/radar/tiles/{radar_code}/obs_{abs(offset)}.png",
                    is_forecast=False,
                    lead_time_min=offset
                )
            )

        # Future nowcast predicted frames (+15m, +30m, +45m, +60m, +90m, +120m)
        for offset in [15, 30, 45, 60, 90, 120]:
            frames.append(
                RadarFrameResponse(
                    frame_id=f"{radar_code}_PRED_PLUS_{offset}M",
                    timestamp=now + datetime.timedelta(minutes=offset),
                    radar_station=radar_code,
                    product_type="MAX_DBZ",
                    bounds=[[28.0, 76.5], [29.2, 77.8]],
                    image_url=f"/api/v1/radar/tiles/{radar_code}/pred_{offset}.png",
                    is_forecast=True,
                    lead_time_min=offset
                )
            )

        return frames

    def get_aws_telemetry(self) -> List[StationObservation]:
        """Returns surface Automatic Weather Station telemetry feeds."""
        now = datetime.datetime.utcnow()
        return [
            StationObservation(
                station_code="AWS-DL-001",
                station_name="Safdarjung Meteorological Station",
                latitude=28.584,
                longitude=77.206,
                temperature_c=29.4,
                relative_humidity_pct=88.0,
                pressure_hpa=1003.2,
                wind_speed_kmh=42.5,
                wind_direction_deg=70.0,
                rain_rate_mm_hr=18.5,
                cape_index=2450.0,
                timestamp=now
            ),
            StationObservation(
                station_code="AWS-DL-002",
                station_name="Palam Met Observatory",
                latitude=28.567,
                longitude=77.098,
                temperature_c=28.8,
                relative_humidity_pct=92.0,
                pressure_hpa=1002.8,
                wind_speed_kmh=58.0,
                wind_direction_deg=65.0,
                rain_rate_mm_hr=34.0,
                cape_index=2780.0,
                timestamp=now
            ),
            StationObservation(
                station_code="AWS-HR-003",
                station_name="Gurugram Weather Post",
                latitude=28.459,
                longitude=77.026,
                temperature_c=31.2,
                relative_humidity_pct=82.0,
                pressure_hpa=1004.5,
                wind_speed_kmh=24.0,
                wind_direction_deg=90.0,
                rain_rate_mm_hr=4.2,
                cape_index=1900.0,
                timestamp=now
            ),
            StationObservation(
                station_code="AWS-UP-004",
                station_name="Noida Sector-62 Weather Unit",
                latitude=28.628,
                longitude=77.365,
                temperature_c=27.5,
                relative_humidity_pct=94.0,
                pressure_hpa=1001.9,
                wind_speed_kmh=64.0,
                wind_direction_deg=60.0,
                rain_rate_mm_hr=48.5,
                cape_index=2950.0,
                timestamp=now
            )
        ]


data_service = DataIngestionService()
