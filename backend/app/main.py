import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.routers import (
    nowcast_router,
    lightning_router,
    radar_router,
    satellite_router,
    alerts_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database table creation and cleanup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AI-driven 0-3 hour spatiotemporal nowcasting API for Thunderstorms, Lightning Hazards, and Extreme Precipitation (SIH26072).",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(nowcast_router, prefix=settings.API_V1_STR)
app.include_router(lightning_router, prefix=settings.API_V1_STR)
app.include_router(radar_router, prefix=settings.API_V1_STR)
app.include_router(satellite_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root_health_check():
    """Service health and system status endpoint."""
    return JSONResponse(
        content={
            "system": "AI-Powered Thunderstorm & Lightning Nowcasting System",
            "code": "SIH26072",
            "status": "OPERATIONAL",
            "version": "1.0.0",
            "docs_url": "/docs",
            "api_prefix": settings.API_V1_STR,
        }
    )


# WebSocket Connection Manager for Real-time Feeds
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass


ws_manager = ConnectionManager()


@app.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint broadcasting real-time lightning detections,
    radar updates, and threshold-crossing severe weather warnings.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Echo or listen for client viewport bounding box changes
            data = await websocket.receive_text()
            response_payload = {
                "event": "HEARTBEAT_ACK",
                "message": "Telemetry stream connected",
                "received": data,
            }
            await websocket.send_text(json.dumps(response_payload))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
