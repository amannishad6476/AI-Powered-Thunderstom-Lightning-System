import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON, Text
from app.database import Base


class AlertModel(Base):
    """Database model for severe weather and lightning alerts."""
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(64), unique=True, index=True)
    severity = Column(String(20), nullable=False)  # minor, moderate, severe, extreme
    event_type = Column(String(50), nullable=False)  # THUNDERSTORM, LIGHTNING, HEAVY_RAIN, SQUALL
    headline = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instruction = Column(Text, nullable=True)
    area_desc = Column(String(255), nullable=False)
    polygon_geojson = Column(JSON, nullable=True)  # GeoJSON bounding polygon
    onset = Column(DateTime, default=datetime.datetime.utcnow)
    expires = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class StationModel(Base):
    """Database model for Automatic Weather Stations (AWS) & Doppler Radars."""
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
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)


class StormCellModel(Base):
    """Database model for detected & tracked convective storm cells."""
    __tablename__ = "storm_cells"

    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(String(64), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_reflectivity_dbz = Column(Float, nullable=False)
    vilt_kg_m2 = Column(Float, default=0.0)  # Vertically Integrated Liquid
    cloud_top_height_km = Column(Float, default=0.0)
    speed_kmh = Column(Float, default=0.0)
    direction_deg = Column(Float, default=0.0)
    severity_level = Column(String(20), default="MODERATE")
    projected_path = Column(JSON, nullable=True)  # List of [lat, lon, lead_time_min]
