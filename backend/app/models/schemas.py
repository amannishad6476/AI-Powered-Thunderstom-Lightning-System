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
    impacted_infrastructure: Optional[List[str]] = None


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


# ---------------------------------------------------------------------------
# PostGIS Spatial & Urban Critical Infrastructure Schemas
# ---------------------------------------------------------------------------
class CriticalInfrastructure(BaseModel):
    """Schema for critical urban infrastructure asset polygons."""
    asset_id: str
    name: str
    category: str  # AIRPORT, POWER_GRID, METRO_NETWORK, POPULATED_SECTOR, HOSPITAL
    risk_tolerance: str  # CRITICAL, HIGH, MODERATE
    centroid_lat: float
    centroid_lng: float
    area_sqkm: float
    contact_agency: str
    alert_threshold_dbz: float
    polygon_geojson: Optional[Dict[str, Any]] = None


class InfrastructureThreatAssessment(BaseModel):
    """Assessment of an active storm cell intersecting an infrastructure polygon."""
    asset_id: str
    name: str
    category: str
    risk_tolerance: str
    distance_to_cell_core_km: float
    estimated_impact_time_min: int
    is_direct_hit: bool
    threat_level: str  # CRITICAL, HIGH, MODERATE
    intersecting_cell_id: str
    cell_max_dbz: float
    recommended_action: str


class HistoricalStormTrackRecord(BaseModel):
    """Historical storm cell track record with PostGIS bounding box and trajectory."""
    cell_id: str
    timestamp: datetime
    centroid: GeoPoint
    radius_km: float
    max_reflectivity_dbz: float
    vil_kg_m2: float
    cloud_top_height_km: float
    speed_kmh: float
    direction_deg: float
    severity_level: str
    bbox_geojson: Optional[Dict[str, Any]] = None
    trajectory_geojson: Optional[Dict[str, Any]] = None


class SpatialIntersectionQueryRequest(BaseModel):
    """Request payload for spatial storm-infrastructure intersection analysis."""
    cell_id: str = "CELL-NCR-01"
    latitude: float = Field(28.7041, description="Storm cell centroid latitude")
    longitude: float = Field(77.1025, description="Storm cell centroid longitude")
    radius_km: float = Field(18.5, description="Storm cell hazard coverage radius in km")
    max_reflectivity_dbz: float = Field(56.4, description="Peak composite reflectivity in dBZ")
    speed_kmh: float = Field(42.0, description="Storm propagation speed in km/h")


class SpatialIntersectionQueryResponse(BaseModel):
    """Response payload with all intersected urban assets and threat assessments."""
    timestamp: datetime
    query_cell_id: str
    storm_radius_km: float
    max_reflectivity_dbz: float
    total_impacted_assets: int
    threat_assessments: List[InfrastructureThreatAssessment]
    critical_alerts_triggered: int


class RadarPeakRecord(BaseModel):
    """Doppler radar peak observation record."""
    radar_station: str
    timestamp: datetime
    peak_dbz: float
    echo_top_km: float
    radial_velocity_ms: float
    scan_elevation_angle: float
    peak_coordinates: GeoPoint
