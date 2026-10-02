import asyncio
import json
import math
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.services.alert_service import alert_service

router = APIRouter(tags=["WebSocket Live Feed"])


class ConnectionManager:
    """
    WebSocket Connection Manager for managing connected dashboard clients
    and broadcasting high-frequency live meteorological telemetry.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        payload = json.dumps(message)
        async with self._lock:
            stale_connections = []
            for connection in self.active_connections:
                try:
                    await connection.send_text(payload)
                except Exception:
                    stale_connections.append(connection)

            for stale in stale_connections:
                if stale in self.active_connections:
                    self.active_connections.remove(stale)


ws_manager = ConnectionManager()


# Base storm cell configurations around Delhi NCR with dynamic vector kinematics
BASE_STORM_CELLS = [
    {
        "cell_id": "CELL-NCR-01",
        "base_lat": 28.7041,
        "base_lng": 77.1025,
        "radius_km": 18.5,
        "base_dbz": 56.4,
        "speed_kmh": 42.0,
        "direction": "ENE",
        "direction_deg": 67.5,
        "cloud_top_height_km": 14.8,
    },
    {
        "cell_id": "CELL-NCR-02",
        "base_lat": 28.4595,
        "base_lng": 77.0266,
        "radius_km": 24.0,
        "base_dbz": 44.2,
        "speed_kmh": 36.0,
        "direction": "NE",
        "direction_deg": 45.0,
        "cloud_top_height_km": 11.5,
    },
    {
        "cell_id": "CELL-NCR-03",
        "base_lat": 28.5355,
        "base_lng": 77.3910,
        "radius_km": 15.0,
        "base_dbz": 52.8,
        "speed_kmh": 45.0,
        "direction": "ENE",
        "direction_deg": 70.0,
        "cloud_top_height_km": 13.9,
    },
    {
        "cell_id": "CELL-NCR-04",
        "base_lat": 28.8920,
        "base_lng": 76.9850,
        "radius_km": 30.2,
        "base_dbz": 38.7,
        "speed_kmh": 30.0,
        "direction": "E",
        "direction_deg": 90.0,
        "cloud_top_height_km": 10.2,
    },
]


def generate_live_weather_frame(step_counter: int) -> Dict[str, Any]:
    """
    Generates a live synthetic weather nowcasting frame simulating continuous
    INSAT-3DR multispectral scans and Doppler radar sweeps (0-3hr window).
    Also runs real-time automated hazard monitoring to evaluate critical
    infrastructure intersections and trigger simulated sirens and dispatch flags.
    """
    now_dt = datetime.now(timezone.utc)
    timestamp = now_dt.isoformat()
    t_seconds = step_counter * 5.0  # 5-second interval simulation clock

    # Drift and modulate storm cells based on physical motion vectors
    active_cells = []
    max_composite_dbz = 0.0

    for idx, base in enumerate(BASE_STORM_CELLS):
        # Convert speed (km/h) to geographic degrees displacement per second
        speed_kms = base["speed_kmh"] / 3600.0
        dist_km = (speed_kms * t_seconds) % 35.0  # Cycle within 35km bounds
        rad = math.radians(base["direction_deg"])

        d_lat = (dist_km * math.cos(rad)) / 111.0
        d_lng = (dist_km * math.sin(rad)) / (111.0 * math.cos(math.radians(base["base_lat"])))

        # Add minor organic pulsation to dBZ and radius
        dbz_variation = round(math.sin(t_seconds / 20.0 + idx) * 2.2, 1)
        current_dbz = round(base["base_dbz"] + dbz_variation, 1)
        radius_variation = round(math.cos(t_seconds / 25.0 + idx) * 1.5, 1)
        current_radius = round(max(8.0, base["radius_km"] + radius_variation), 1)

        if current_dbz > max_composite_dbz:
            max_composite_dbz = current_dbz

        # Determine dynamic severity label
        if current_dbz >= 50.0:
            intensity_str = f"Severe ({current_dbz} dBZ)"
        elif current_dbz >= 38.0:
            intensity_str = f"Moderate ({current_dbz} dBZ)"
        else:
            intensity_str = f"Light ({current_dbz} dBZ)"

        active_cells.append(
            {
                "cell_id": base["cell_id"],
                "lat": round(base["base_lat"] + d_lat, 5),
                "lng": round(base["base_lng"] + d_lng, 5),
                "radius_km": current_radius,
                "intensity": intensity_str,
                "dbz": current_dbz,
                "speed_kmh": base["speed_kmh"],
                "direction": base["direction"],
                "cloud_top_height_km": round(base["cloud_top_height_km"] + math.sin(t_seconds / 30.0) * 0.4, 1),
            }
        )

    # Dynamic thunderstorm probability
    prob_val = min(96, max(75, int(85 + math.sin(t_seconds / 15.0) * 8)))
    risk_level = "Severe" if prob_val >= 80 else "Moderate"

    # Evaluate Automated Hazard & Siren Triggers against critical infrastructure
    siren_assessment = alert_service.evaluate_hazard_and_trigger_siren(active_cells, current_time=now_dt)

    # Simulate real-time lightning strike event in proximity of active convective core
    strike_event = None
    if random.random() < 0.75:  # 75% chance of strike every 5 seconds
        target_cell = active_cells[0]
        strike_lat = target_cell["lat"] + random.uniform(-0.06, 0.06)
        strike_lng = target_cell["lng"] + random.uniform(-0.06, 0.06)
        strike_event = {
            "id": f"LTG-{random.randint(10000, 99999)}",
            "lat": round(strike_lat, 5),
            "lng": round(strike_lng, 5),
            "amplitude_ka": round(random.uniform(-75.0, 45.0), 1),
            "strike_type": "CG" if random.random() > 0.3 else "IC",
            "timestamp": timestamp,
        }

    # Satellite cloud top temperature variation
    cloud_temp = round(204.5 + math.sin(t_seconds / 40.0) * 1.8, 1)

    return {
        "event": "WEATHER_UPDATE",
        "frame_index": step_counter,
        "timestamp": timestamp,
        "region_name": "National Capital Region (Delhi NCR)",
        "thunderstorm_probability": f"{prob_val}%",
        "lightning_risk_level": risk_level,
        "active_storm_cells": active_cells,
        "multi_radar_inputs": {
            "active_stations": [
                "Delhi Palam DWR (S-Band Doppler Radar)",
                "Mausam Bhavan DWR (C-Band Doppler Radar)",
                "Jaipur Regional DWR Network",
            ],
            "composite_max_dbz": max_composite_dbz,
            "elevation_scans_deg": [0.5, 1.0, 2.0, 4.5, 9.0, 15.0],
            "update_interval_min": 10,
            "scan_azimuth_deg": round((t_seconds * 12.0) % 360.0, 1),
        },
        "satellite_inputs": {
            "satellite_source": "INSAT-3DR / INSAT-3D Multispectral Imager",
            "channels": ["TIR-1 (10.8 µm)", "MIR (3.9 µm)", "WV (6.7 µm)"],
            "cloud_top_temp_kelvin": cloud_temp,
            "overshooting_tops": cloud_temp < 205.0,
            "scan_slot_ist": datetime.now(timezone.utc).strftime("%H:%M UTC"),
        },
        "latest_strike": strike_event,
        "emergency_siren_trigger": siren_assessment,
        "critical_asset_impacts": siren_assessment.get("threatened_assets", []),
        "active_emergency_alerts": siren_assessment.get("active_emergency_alerts", []),
        "emergency_dispatch_flags": siren_assessment.get("dispatch_flags", []),
        "nowcast_summary": {
            "estimated_arrival_minutes": max(5, int(20 - (t_seconds / 60.0) % 15)),
            "peak_wind_gust_kmh": round(76.5 + math.cos(t_seconds / 20.0) * 4.5, 1),
            "expected_precipitation_mm_hr": round(48.0 + math.sin(t_seconds / 15.0) * 6.0, 1),
            "cape_j_kg": round(2840.0 + math.sin(t_seconds / 30.0) * 120.0, 0),
            "cin_j_kg": -15.0,
            "severe_hazard_warnings": [
                "High-frequency Cloud-to-Ground (CG) lightning risk within 25km radius",
                "Localized convective squall and urban waterlogging alert",
            ] + (
                [f"🚨 EMERGENCY SIREN TRIGGERED: {siren_assessment.get('siren_level')}"]
                if siren_assessment.get("siren_triggered")
                else []
            ),
        },
    }


async def stream_live_weather(websocket: WebSocket):
    """
    Continuously pushes real-time synthetic weather and radar scans
    every 5 seconds to the connected client.
    """
    step = 0
    while True:
        try:
            frame = generate_live_weather_frame(step)
            await websocket.send_text(json.dumps(frame))
            step += 1
            await asyncio.sleep(5.0)
        except (WebSocketDisconnect, asyncio.CancelledError):
            break
        except Exception as err:
            print(f"[WebSocket Stream Exception]: {err}")
            break


@router.websocket("/ws/live-feed")
@router.websocket("/live-feed")
async def websocket_live_feed_endpoint(websocket: WebSocket):
    """
    Production WebSocket endpoint broadcasting real-time 5-second
    INSAT-3DR satellite scans and Doppler radar frames.
    """
    await ws_manager.connect(websocket)
    # Start sender task
    stream_task = asyncio.create_task(stream_live_weather(websocket))

    try:
        # Send initial snapshot immediately
        initial_frame = generate_live_weather_frame(0)
        await websocket.send_text(json.dumps(initial_frame))

        # Listen for client control messages (e.g. Heartbeat, Viewport, Filter)
        while True:
            client_msg = await websocket.receive_text()
            try:
                parsed = json.loads(client_msg)
                action = parsed.get("action") or parsed.get("type")
                if action == "PING":
                    await websocket.send_text(
                        json.dumps({"event": "PONG", "timestamp": datetime.now(timezone.utc).isoformat()})
                    )
            except Exception:
                # Raw text ack
                await websocket.send_text(
                    json.dumps({"event": "ACK", "received": client_msg, "timestamp": datetime.now(timezone.utc).isoformat()})
                )
    except WebSocketDisconnect:
        pass
    finally:
        stream_task.cancel()
        await ws_manager.disconnect(websocket)
