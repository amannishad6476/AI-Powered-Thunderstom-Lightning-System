from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.models.schemas import WeatherAlert, StationObservation
from app.services.alert_service import alert_service
from app.services.data_ingestion import data_service

router = APIRouter(prefix="/alerts", tags=["Severe Weather Alerts & Emergency Warnings"])


@router.get("/active", response_model=List[WeatherAlert])
async def get_active_alerts(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090)
):
    """Returns real-time CAP-compliant thunderstorm, lightning, and squall warnings."""
    return alert_service.get_active_alerts(lat, lon)


@router.get("/aws-stations", response_model=List[StationObservation])
async def get_aws_stations():
    """Returns live telemetry from ground automatic weather stations."""
    return data_service.get_aws_telemetry()


@router.get("/critical-assets")
async def get_critical_assets():
    """Returns registered critical urban infrastructure asset catalog."""
    return alert_service.get_critical_assets()


@router.get("/siren-status")
async def get_siren_status():
    """
    Returns the current automated emergency siren trigger status,
    active dispatch flags, and critical infrastructure threat assessments.
    """
    # Default active storm cell scenario around Delhi NCR
    sample_cells = [
        {
            "cell_id": "CELL-NCR-01",
            "lat": 28.7041,
            "lng": 77.1025,
            "radius_km": 18.5,
            "dbz": 56.4,
            "speed_kmh": 42.0,
            "direction": "ENE"
        },
        {
            "cell_id": "CELL-NCR-03",
            "lat": 28.5355,
            "lng": 77.3910,
            "radius_km": 15.0,
            "dbz": 52.8,
            "speed_kmh": 45.0,
            "direction": "ENE"
        }
    ]
    return alert_service.evaluate_hazard_and_trigger_siren(sample_cells)


@router.post("/evaluate")
async def evaluate_custom_hazard(
    storm_cells: List[Dict[str, Any]] = Body(...)
):
    """
    Evaluates arbitrary storm cell coordinates against critical urban infrastructure
    polygons and returns siren triggers and automated dispatch flags.
    """
    return alert_service.evaluate_hazard_and_trigger_siren(storm_cells)
