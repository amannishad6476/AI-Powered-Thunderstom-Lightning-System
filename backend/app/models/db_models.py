"""
PostgreSQL PostGIS Database Models (SIH26072)
Defines spatial tables for historical storm tracks, bounding box geometries,
timestamped radar reflectivity peaks, critical urban infrastructure assets, and CAP weather alerts.
"""

import datetime
from typing import Any, Dict, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    JSON,
    Text,
    ForeignKey,
    Index,
)
from app.database import Base

try:
    from geoalchemy2 import Geometry
    HAS_GEOALCHEMY = True
except ImportError:
    HAS_GEOALCHEMY = False
    # Fallback to JSON or Text if GeoAlchemy2 is not installed in minimal development
    def Geometry(*args, **kwargs):
        return JSON


class HistoricalStormTrackModel(Base):
    """
    PostGIS spatial table storing detected and predicted convective storm cell tracks,
    spatial centroid coordinates, bounding box footprint polygons, and motion trajectories.
    """
    __tablename__ = "historical_storm_tracks"

    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(String(64), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    
    # Coordinates and Metrics
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=15.0)
    max_reflectivity_dbz = Column(Float, nullable=False)
    vil_kg_m2 = Column(Float, default=0.0)  # Vertically Integrated Liquid
    cloud_top_height_km = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=0.0)
    direction_deg = Column(Float, default=0.0)
    severity_level = Column(String(32), default="SEVERE")  # LOW, MODERATE, SEVERE, EXTREME

    # PostGIS Spatial Geometries (SRID 4326: WGS 84 GPS Coordinates)
    # 1. Point geometry of storm cell centroid
    location_geom = Column(Geometry("POINT", srid=4326), nullable=True)
    # 2. Polygon geometry of storm cell bounding box / hazard coverage zone
    bbox_geom = Column(Geometry("POLYGON", srid=4326), nullable=True)
    # 3. LineString geometry of past and projected 0-2hr trajectory path
    trajectory_geom = Column(Geometry("LINESTRING", srid=4326), nullable=True)

    # GeoJSON and Raw metadata
    raw_geojson = Column(JSON, nullable=True)
    projected_track_json = Column(JSON, nullable=True)

    __table_args__ = (
        Index("idx_storm_tracks_cell_time", "cell_id", "timestamp"),
    )


class CriticalInfrastructureModel(Base):
    """
    PostGIS spatial table storing urban critical infrastructure polygons
    (Airports, Power Grids, Metro Transit Hubs, Densely Populated Sectors, Hospitals).
    Used for real-time spatial intersection queries during convective storm nowcasting.
    """
    __tablename__ = "critical_infrastructure"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)  # AIRPORT, POWER_GRID, METRO_NETWORK, POPULATED_SECTOR, HOSPITAL
    risk_tolerance = Column(String(32), default="CRITICAL")  # CRITICAL, HIGH, MODERATE
    
    centroid_lat = Column(Float, nullable=False)
    centroid_lng = Column(Float, nullable=False)
    area_sqkm = Column(Float, default=1.0)
    
    # PostGIS Polygon boundary of the urban infrastructure asset (SRID 4326)
    polygon_geom = Column(Geometry("POLYGON", srid=4326), nullable=True)
    polygon_geojson = Column(JSON, nullable=True)
    
    contact_agency = Column(String(128), default="Delhi Disaster Management Authority (DDMA)")
    alert_threshold_dbz = Column(Float, default=45.0)  # Trigger warning when storm dBZ exceeds threshold
    is_active = Column(Boolean, default=True)


class RadarReflectivityPeakModel(Base):
    """
    PostGIS table storing timestamped Doppler Weather Radar composite reflectivity peaks,
    echo tops, and spatial detection bounds.
    """
    __tablename__ = "radar_reflectivity_peaks"

    id = Column(Integer, primary_key=True, index=True)
    radar_station = Column(String(64), index=True, nullable=False)  # DELHI_PALAM_DWR, MAUSAM_BHAVAN_DWR
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    
    peak_dbz = Column(Float, nullable=False)
    echo_top_km = Column(Float, default=0.0)
    radial_velocity_ms = Column(Float, default=0.0)
    scan_elevation_angle = Column(Float, default=0.5)
    
    # PostGIS Point of highest radar core echo
    peak_geom = Column(Geometry("POINT", srid=4326), nullable=True)
    # PostGIS Polygon of radar scan coverage area
    scan_bounds_geom = Column(Geometry("POLYGON", srid=4326), nullable=True)
    
    product_type = Column(String(32), default="MAX_DBZ")  # MAX_DBZ, PPI, CAPPI, VELOCITY


class AlertModel(Base):
    """
    PostGIS spatial table for CAP-compliant weather warnings and issued lightning alerts
    with geofenced impact polygon boundaries.
    """
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(64), unique=True, index=True, nullable=False)
    severity = Column(String(32), nullable=False)  # MINOR, MODERATE, SEVERE, EXTREME
    event_type = Column(String(64), nullable=False)  # THUNDERSTORM, LIGHTNING, SQUALL, FLASH_FLOOD
    headline = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instruction = Column(Text, nullable=True)
    area_desc = Column(String(255), nullable=False)
    
    # PostGIS Polygon of the issued geofence warning zone
    geofence_geom = Column(Geometry("POLYGON", srid=4326), nullable=True)
    polygon_geojson = Column(JSON, nullable=True)
    
    # Intersected Urban Infrastructure Assets List
    impacted_infrastructure = Column(JSON, nullable=True)  # List of asset names intersected by storm cell
    
    onset = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc))
    expires = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc))


class StationModel(Base):
    """
    Database model for Automatic Weather Stations (AWS) & Doppler Radars.
    """
    __tablename__ = "weather_stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(32), unique=True, index=True)
    station_name = Column(String(100), nullable=False)
    station_type = Column(String(30), default="AWS")  # AWS, DWR, LIGHTNING_SENSOR
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=0.0)
    state = Column(String(50), nullable=False)
    is_operational = Column(Boolean, default=True)
    last_ping = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.timezone.utc))

    location_geom = Column(Geometry("POINT", srid=4326), nullable=True)
