from fastapi import APIRouter, Query
from app.models.schemas import LightningPredictionResponse, LightningStrike
from app.services.lightning_engine import lightning_engine
from typing import List

router = APIRouter(prefix="/lightning", tags=["Lightning Hazard & Strike Prediction"])


@router.get("/recent-strikes", response_model=List[LightningStrike])
async def get_recent_strikes(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    radius_km: float = Query(100.0),
    lookback_minutes: int = Query(30, ge=5, le=180)
):
    """Returns detected Cloud-to-Ground (CG) and Intra-Cloud (IC) lightning flashes."""
    return lightning_engine.get_recent_strikes(lat, lon, radius_km, lookback_minutes)


@router.get("/prediction-grid", response_model=LightningPredictionResponse)
async def get_lightning_prediction_grid(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    radius_km: float = Query(80.0),
    horizon_min: int = Query(60, ge=15, le=120)
):
    """
    Computes high-resolution spatial strike risk probabilities and identifies red-alert hotspots
    leveraging convective parameters and radar VIL.
    """
    return lightning_engine.predict_lightning_risk_grid(lat, lon, radius_km, horizon_min)
