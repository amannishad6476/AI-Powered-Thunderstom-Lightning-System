from app.routers.nowcast import router as nowcast_router
from app.routers.lightning import router as lightning_router
from app.routers.radar import router as radar_router
from app.routers.satellite import router as satellite_router
from app.routers.alerts import router as alerts_router

__all__ = [
    "nowcast_router",
    "lightning_router",
    "radar_router",
    "satellite_router",
    "alerts_router",
]
