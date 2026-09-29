from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.models.schemas import RadarFrameResponse
from app.services.data_ingestion import data_service

router = APIRouter(prefix="/radar", tags=["Doppler Weather Radar (DWR)"])


@router.get("/frames", response_model=List[RadarFrameResponse])
async def get_radar_frames(
    radar_station: str = Query("DELHI_DWR", description="Radar Station Code (DELHI_DWR, MUMBAI_DWR, CHENNAI_DWR, KOLKATA_DWR)")
):
    """
    Returns time-ordered sequence of observed volume scans (-30m to 0m)
    and AI-predicted future nowcast reflectivity layers (+15m to +120m).
    """
    return data_service.get_active_radar_frames(radar_station)


@router.get("/stations")
async def get_operational_radars():
    """Returns list of active Doppler Weather Radar stations across India."""
    return [
        {"code": "DELHI_DWR", "name": "Delhi Safdarjung DWR (S-Band / C-Band)", "latitude": 28.584, "longitude": 77.206, "range_km": 250},
        {"code": "MUMBAI_DWR", "name": "Mumbai Colaba Radar", "latitude": 18.898, "longitude": 72.812, "range_km": 250},
        {"code": "KOLKATA_DWR", "name": "Kolkata Alipore Radar", "latitude": 22.528, "longitude": 88.330, "range_km": 250},
        {"code": "CHENNAI_DWR", "name": "Chennai Port Radar", "latitude": 13.084, "longitude": 80.292, "range_km": 250},
        {"code": "JAIPUR_DWR", "name": "Jaipur Meteorological Centre DWR", "latitude": 26.824, "longitude": 75.802, "range_km": 250},
        {"code": "PATNA_DWR", "name": "Patna Airport Radar", "latitude": 25.591, "longitude": 85.088, "range_km": 250}
    ]
