from fastapi import APIRouter, Query
from typing import List
from app.models.schemas import WeatherAlert, StationObservation
from app.services.alert_service import alert_service
from app.services.data_ingestion import data_service

router = APIRouter(prefix="/alerts", tags=["Severe Weather Alerts & Warnings"])


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
