try:
    from app.routers.websocket import router as websocket_router, ws_manager
except Exception:
    websocket_router = None
    ws_manager = None

try:
    from app.routers.nowcast import router as nowcast_router
except Exception:
    nowcast_router = None

try:
    from app.routers.lightning import router as lightning_router
except Exception:
    lightning_router = None

try:
    from app.routers.radar import router as radar_router
except Exception:
    radar_router = None

try:
    from app.routers.satellite import router as satellite_router
except Exception:
    satellite_router = None

try:
    from app.routers.alerts import router as alerts_router
except Exception:
    alerts_router = None

__all__ = [
    "websocket_router",
    "ws_manager",
    "nowcast_router",
    "lightning_router",
    "radar_router",
    "satellite_router",
    "alerts_router",
]
