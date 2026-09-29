from datetime import datetime
from fastapi import APIRouter, Query
from typing import Dict, Any

router = APIRouter(prefix="/satellite", tags=["INSAT-3D / 3DR Satellite Products"])


@router.get("/products")
async def get_satellite_products():
    """Returns available satellite imaging products and latest acquisition timestamps."""
    now = datetime.utcnow()
    return {
        "satellite": "INSAT-3DR / 3D (ISRO / MOSDAC)",
        "timestamp": now.isoformat(),
        "available_channels": [
            {
                "id": "TIR1",
                "name": "Thermal Infrared 1 (10.8 µm)",
                "use_case": "Cloud Top Brightness Temperature & Deep Convection Tracking",
                "resolution_km": 4.0,
                "latest_slot": now.strftime("%Y-%m-%d %H:00 UTC")
            },
            {
                "id": "TIR2",
                "name": "Thermal Infrared 2 (12.0 µm)",
                "use_case": "Split-Window Differential Water Vapor & Cirrus Cloud Detection",
                "resolution_km": 4.0,
                "latest_slot": now.strftime("%Y-%m-%d %H:00 UTC")
            },
            {
                "id": "WV",
                "name": "Water Vapor (6.8 µm)",
                "use_case": "Upper Tropospheric Moisture & Jet Stream Dynamics",
                "resolution_km": 8.0,
                "latest_slot": now.strftime("%Y-%m-%d %H:00 UTC")
            },
            {
                "id": "RGB_SANDWICH",
                "name": "Enhanced Convective Cloud Sandwich (VIS + IR)",
                "use_case": "Overshooting Top and Severe Thunderstorm Cloud Texture Visualization",
                "resolution_km": 1.0,
                "latest_slot": now.strftime("%Y-%m-%d %H:00 UTC")
            }
        ]
    }
