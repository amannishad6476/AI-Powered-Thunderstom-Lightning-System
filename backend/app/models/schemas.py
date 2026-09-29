from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Coordinate Point
class GeoPoint(BaseModel):
    latitude: float
    longitude: float


# Lightning Strike Event
class LightningStrike(BaseModel):
    id: str
    latitude: float
    longitude: float
    timestamp: datetime
    amplitude_ka: float = Field(..., description="Peak current in kiloAmperes (positive/negative)")
    strike_type: str = Field("CG", description="Cloud-to-Ground (CG) or Intra-Cloud (IC)")
    confidence: float = Field(0.95, ge=0.0, le=1.0)


# Storm Cell Information
class StormCell(BaseModel):
    cell_id: str
    latitude: float
    longitude: float
    max_reflectivity_dbz: float
    cloud_top_height_km: float
    vil_kg_m2: float = Field(..., description="Vertically Integrated Liquid")
    speed_kmh: float
    direction_deg: float
    severity_level: str  # LOW, MODERATE, SEVERE, EXTREME
    projected_track: List[Dict[str, Any]] = Field(
        default=[],
        description="Predicted positions at +15m, +30m, +45m, +60m, +90m, +120m"
    )


# Nowcast Query & Result
class NowcastRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 100.0
    lead_time_minutes: int = 120  # 0 to 180 min nowcasting window


class NowcastPointSummary(BaseModel):
    precipitation_rate_mm_hr: float
    reflectivity_dbz: float
    lightning_strike_probability: float  # 0.0 to 1.0
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    storm_arrival_time_min: Optional[int] = None
    wind_gust_kmh: float
    cape_j_kg: float
    cin_j_kg: float


class NowcastResponse(BaseModel):
    timestamp: datetime
    query_location: GeoPoint
    radius_km: float
    summary: NowcastPointSummary
    active_cells: List[StormCell]
    recent_lightning_strikes: List[LightningStrike]
    forecast_timeline: List[Dict[str, Any]]


# Radar Frame Data
class RadarFrameResponse(BaseModel):
    frame_id: str
    timestamp: datetime
    radar_station: str
    product_type: str  # MAX_DBZ, PPI, CAPPI, VELOCITY
    bounds: List[List[float]]  # [[min_lat, min_lon], [max_lat, max_lon]]
    image_url: Optional[str] = None
    tile_url_template: Optional[str] = None
    is_forecast: bool = False
    lead_time_min: int = 0


# Lightning Prediction Grid
class LightningPredictionResponse(BaseModel):
    timestamp: datetime
    forecast_horizon_min: int
    strike_risk_grid: List[Dict[str, Any]]  # List of grid cells with risk probability
    total_predicted_flashes: int
    hotspots: List[Dict[str, Any]]


# Weather Alert CAP
class WeatherAlert(BaseModel):
    alert_id: str
    severity: str
    event_type: str
    headline: str
    description: str
    instruction: Optional[str] = None
    area_desc: str
    polygon_geojson: Optional[Dict[str, Any]] = None
    onset: datetime
    expires: datetime
    is_active: bool = True


# Automatic Weather Station (AWS) Observation
class StationObservation(BaseModel):
    station_code: str
    station_name: str
    latitude: float
    longitude: float
    temperature_c: float
    relative_humidity_pct: float
    pressure_hpa: float
    wind_speed_kmh: float
    wind_direction_deg: float
    rain_rate_mm_hr: float
    cape_index: float
    timestamp: datetime
