import datetime
import math
from typing import List, Dict, Any, Optional
from app.models.schemas import (
    WeatherAlert,
    CriticalInfrastructure,
    InfrastructureThreatAssessment,
    SpatialIntersectionQueryResponse,
)
from app.utils.geo_utils import haversine_distance


# ---------------------------------------------------------------------------
# Critical Urban Infrastructure Assets Catalog (National Capital Region)
# ---------------------------------------------------------------------------
CRITICAL_ASSETS: List[Dict[str, Any]] = [
    {
        "asset_id": "ASSET-DEL-IGI",
        "name": "Indira Gandhi International Airport (DEL)",
        "category": "AIRPORT",
        "risk_tolerance": "CRITICAL",
        "centroid_lat": 28.5562,
        "centroid_lng": 77.1000,
        "radius_km": 6.5,
        "area_sqkm": 51.0,
        "contact_agency": "Air Traffic Control (ATC) Delhi & AAI Emergency Ops",
        "alert_threshold_dbz": 45.0,
        "dispatch_flags": [
            "AIRPORT_GROUND_STOP",
            "RUNWAY_MICROBURST_SHEAR_ALERT",
            "SUSPEND_RAMP_OPERATIONS",
            "DIVERT_INBOUND_APPROACHES"
        ],
        "polygon_geojson": {
            "type": "Polygon",
            "coordinates": [[
                [77.060, 28.540],
                [77.135, 28.540],
                [77.135, 28.585],
                [77.060, 28.585],
                [77.060, 28.540]
            ]]
        }
    },
    {
        "asset_id": "ASSET-DEL-AIIMS",
        "name": "AIIMS New Delhi & Apex Trauma Center",
        "category": "HOSPITAL",
        "risk_tolerance": "CRITICAL",
        "centroid_lat": 28.5672,
        "centroid_lng": 77.2100,
        "radius_km": 3.2,
        "area_sqkm": 18.0,
        "contact_agency": "AIIMS Disaster Management & Delhi Health Services",
        "alert_threshold_dbz": 48.0,
        "dispatch_flags": [
            "AIIMS_BACKUP_POWER_ENGAGED",
            "TRAUMA_FLOOD_DEFENSE_BARRIERS",
            "PRIORITY_OXYGEN_SUPPLY_LOCK",
            "DISPATCH_STANDBY_AMBULANCE_FLEET"
        ],
        "polygon_geojson": {
            "type": "Polygon",
            "coordinates": [[
                [77.195, 28.555],
                [77.225, 28.555],
                [77.225, 28.580],
                [77.195, 28.580],
                [77.195, 28.555]
            ]]
        }
    },
    {
        "asset_id": "ASSET-DEL-GRID-BAWANA",
        "name": "Delhi 400kV Bawana / Rohini Super Power Grid",
        "category": "POWER_GRID",
        "risk_tolerance": "CRITICAL",
        "centroid_lat": 28.7850,
        "centroid_lng": 77.0500,
        "radius_km": 4.8,
        "area_sqkm": 25.0,
        "contact_agency": "Delhi Transco Limited (DTL) State Load Dispatch Center",
        "alert_threshold_dbz": 46.0,
        "dispatch_flags": [
            "GRID_SURGE_ARREST_ACTIVE",
            "TRANSFORMER_ISOLATION_STANDBY",
            "AUTOMATED_FEEDER_TRIP_ENGAGED",
            "DTL_EMERGENCY_REPAIR_CREW_ALERT"
        ],
        "polygon_geojson": {
            "type": "Polygon",
            "coordinates": [[
                [77.020, 28.760],
                [77.085, 28.760],
                [77.085, 28.815],
                [77.020, 28.815],
                [77.020, 28.760]
            ]]
        }
    },
    {
        "asset_id": "ASSET-DEL-GRID-MBAGH",
        "name": "Maharani Bagh 220kV Transmission Substation",
        "category": "POWER_GRID",
        "risk_tolerance": "HIGH",
        "centroid_lat": 28.5700,
        "centroid_lng": 77.2600,
        "radius_km": 3.5,
        "area_sqkm": 15.0,
        "contact_agency": "BSES Yamuna Power Grid Operations",
        "alert_threshold_dbz": 46.0,
        "dispatch_flags": [
            "SUBSTATION_FLOOD_PUMP_ENGAGED",
            "FEEDER_RECONFIGURATION_READY",
            "ISOLATE_LOW_LYING_SWITCHGEAR"
        ],
        "polygon_geojson": {
            "type": "Polygon",
            "coordinates": [[
                [77.245, 28.555],
                [77.275, 28.555],
                [77.275, 28.585],
                [77.245, 28.585],
                [77.245, 28.555]
            ]]
        }
    },
    {
        "asset_id": "ASSET-DEL-METRO-RAJIV",
        "name": "Rajiv Chowk Metro Transit Interchange Hub",
        "category": "METRO_NETWORK",
        "risk_tolerance": "HIGH",
        "centroid_lat": 28.6328,
        "centroid_lng": 77.2197,
        "radius_km": 2.8,
        "area_sqkm": 12.0,
        "contact_agency": "Delhi Metro Rail Corporation (DMRC) Control Center",
        "alert_threshold_dbz": 48.0,
        "dispatch_flags": [
            "METRO_SPEED_RESTRICTION_30KMH",
            "STATION_DRAINAGE_SUMP_PUMPS_ACTIVE",
            "PASSENGER_CONCOURSE_SHELTER_ANNOUNCEMENT"
        ],
        "polygon_geojson": {
            "type": "Polygon",
            "coordinates": [[
                [77.205, 28.620],
                [77.235, 28.620],
                [77.235, 28.645],
                [77.205, 28.645],
                [77.205, 28.620]
            ]]
        }
    },
]


class AlertService:
    """
    Automated Early Warning & Emergency Siren Service adhering to CAP-1.2.
    Evaluates active storm cell tracks against critical infrastructure polygons,
    calculates spatial intersections and kinematic ETAs, and triggers simulated
    high-priority siren hooks and emergency dispatch flags.
    """

    def __init__(self):
        self.critical_assets = CRITICAL_ASSETS

    def get_critical_assets(self) -> List[Dict[str, Any]]:
        """Returns registered critical urban infrastructure asset catalog."""
        return self.critical_assets

    def evaluate_hazard_and_trigger_siren(
        self,
        active_storm_cells: List[Dict[str, Any]],
        current_time: Optional[datetime.datetime] = None
    ) -> Dict[str, Any]:
        """
        Evaluates active storm cells against critical assets.
        Triggers emergency sirens and dispatch flags if:
        1. Any storm cell reflectivity exceeds 50.0 dBZ.
        2. Any storm cell intersects or approaches a critical infrastructure asset with ETA < 15 minutes.
        """
        now = current_time or datetime.datetime.now(datetime.timezone.utc)
        threatened_assets: List[Dict[str, Any]] = []
        active_dispatch_flags = set()
        max_detected_dbz = 0.0
        critical_threat_count = 0

        # Evaluate each active storm cell
        for cell in active_storm_cells:
            cell_lat = float(cell.get("lat") or cell.get("latitude") or 0.0)
            cell_lng = float(cell.get("lng") or cell.get("longitude") or 0.0)
            cell_dbz = float(cell.get("dbz") or cell.get("max_reflectivity_dbz") or 0.0)
            cell_radius = float(cell.get("radius_km") or 15.0)
            cell_speed = max(10.0, float(cell.get("speed_kmh") or 35.0))
            cell_id = str(cell.get("cell_id") or "CELL-UNK")

            if cell_dbz > max_detected_dbz:
                max_detected_dbz = cell_dbz

            for asset in self.critical_assets:
                dist_km = haversine_distance(
                    cell_lat, cell_lng,
                    asset["centroid_lat"], asset["centroid_lng"]
                )

                # Direct hit condition: within combined radii
                is_direct_hit = dist_km <= (cell_radius + asset["radius_km"])

                # Estimated Time of Arrival (minutes) based on speed vector
                if is_direct_hit:
                    eta_min = 0
                else:
                    eta_min = max(1, int(round((dist_km / cell_speed) * 60)))

                # Check if asset alert threshold is met and ETA is within operational window (<= 45m)
                is_threatened = (
                    (is_direct_hit or eta_min <= 45) and
                    (cell_dbz >= asset["alert_threshold_dbz"] or cell_dbz >= 44.0)
                )

                if is_threatened:
                    # Classify threat level
                    if cell_dbz >= 50.0 and (is_direct_hit or eta_min <= 15):
                        threat_level = "CRITICAL"
                        critical_threat_count += 1
                        for flag in asset.get("dispatch_flags", []):
                            active_dispatch_flags.add(flag)
                    elif cell_dbz >= 45.0 and eta_min <= 30:
                        threat_level = "HIGH"
                        for flag in asset.get("dispatch_flags", []):
                            active_dispatch_flags.add(flag)
                    else:
                        threat_level = "MODERATE"

                    # Formulate recommended action
                    if asset["category"] == "AIRPORT":
                        rec_action = "Initiate ATC Ground Stop, suspend tarmac refueling, and divert inbound approach vectors."
                    elif asset["category"] == "HOSPITAL":
                        rec_action = "Engage emergency generator backups, deploy flood barriers, and alert trauma triage units."
                    elif asset["category"] == "POWER_GRID":
                        rec_action = "Arm lightning surge arresters, isolate sensitive switchgear, and place rapid repair crews on standby."
                    elif asset["category"] == "METRO_NETWORK":
                        rec_action = "Impose 30 km/h surface speed limit, activate sump drainage, and direct concourse passenger sheltering."
                    else:
                        rec_action = "Execute standard urban severe storm defense protocols."

                    threatened_assets.append({
                        "asset_id": asset["asset_id"],
                        "name": asset["name"],
                        "category": asset["category"],
                        "risk_tolerance": asset["risk_tolerance"],
                        "distance_to_cell_core_km": round(dist_km, 2),
                        "estimated_impact_time_min": eta_min,
                        "is_direct_hit": is_direct_hit,
                        "threat_level": threat_level,
                        "intersecting_cell_id": cell_id,
                        "cell_max_dbz": cell_dbz,
                        "contact_agency": asset["contact_agency"],
                        "recommended_action": rec_action,
                        "polygon_geojson": asset.get("polygon_geojson")
                    })

        # Siren Trigger Criteria:
        # Trigger Siren if Max dBZ >= 50 OR any Critical Asset ETA <= 15 minutes
        has_severe_core = max_detected_dbz >= 50.0
        has_imminent_asset_hit = any(
            t["estimated_impact_time_min"] <= 15 and t["cell_max_dbz"] >= 45.0
            for t in threatened_assets
        )
        siren_triggered = has_severe_core or has_imminent_asset_hit

        if siren_triggered:
            if max_detected_dbz >= 54.0 or critical_threat_count >= 2:
                siren_level = "LEVEL_3_HIGH_PRIORITY_KLAXON"
                siren_sound = "SEVERE_CONVECTIVE_SIREN_120DB"
                frequency_hz = 960
            else:
                siren_level = "LEVEL_2_TACTICAL_WARNING"
                siren_sound = "TACTICAL_THUNDERSTORM_ALERT_95DB"
                frequency_hz = 720

            emergency_text = (
                f"🚨 RED ALERT: Severe convective storm cell detected ({max_detected_dbz} dBZ) "
                f"with {len(threatened_assets)} critical infrastructure asset(s) under imminent threat. "
                "Automated sirens activated. Immediate indoor shelter mandatory."
            )
        else:
            siren_level = "NORMAL_SURVEILLANCE"
            siren_sound = "NONE"
            frequency_hz = 0
            emergency_text = "Standard meteorological surveillance active. No imminent emergency siren triggered."

        # Dynamically generate CAP-1.2 alerts
        active_alerts = self.generate_dynamic_cap_alerts(
            siren_triggered=siren_triggered,
            max_dbz=max_detected_dbz,
            threatened_assets=threatened_assets,
            now=now
        )

        return {
            "siren_triggered": siren_triggered,
            "siren_level": siren_level,
            "siren_sound": siren_sound,
            "siren_frequency_hz": frequency_hz,
            "automated_klaxon_active": siren_triggered,
            "emergency_broadcast_text": emergency_text,
            "dispatch_flags": sorted(list(active_dispatch_flags)),
            "max_reflectivity_dbz": max_detected_dbz,
            "critical_threat_count": critical_threat_count,
            "threatened_assets": threatened_assets,
            "active_emergency_alerts": active_alerts,
            "evaluated_at": now.isoformat(),
        }

    def generate_dynamic_cap_alerts(
        self,
        siren_triggered: bool,
        max_dbz: float,
        threatened_assets: List[Dict[str, Any]],
        now: datetime.datetime
    ) -> List[Dict[str, Any]]:
        """Generates dynamic CAP-1.2 compliant weather warning payload."""
        alerts = []
        impacted_names = [a["name"] for a in threatened_assets]

        if siren_triggered:
            alerts.append({
                "alert_id": f"CAP-IN-IMD-SIREN-{now.strftime('%Y%m%d%H%M')}-01",
                "severity": "EXTREME" if max_dbz >= 54.0 else "SEVERE",
                "event_type": "LIGHTNING_AND_SQUALL",
                "headline": f"RED ALERT: Severe Thunderstorm & High-Frequency Lightning Core ({max_dbz} dBZ)",
                "description": (
                    f"ConvLSTM AI Nowcasting and Doppler Radar networks have detected extreme convective storm cores "
                    f"peaking at {max_dbz} dBZ. Critical infrastructure intersections identified across Delhi NCR grid. "
                    "Automated siren hooks and emergency dispatch protocols are engaged."
                ),
                "instruction": "Seek immediate sturdy shelter. Stay indoors. Avoid open fields, tall trees, and power lines.",
                "area_desc": "Delhi NCR, IGI Airport corridor, Rohini, Gurugram, Noida",
                "polygon_geojson": {
                    "type": "Polygon",
                    "coordinates": [[
                        [76.85, 28.35],
                        [77.45, 28.35],
                        [77.50, 28.85],
                        [76.80, 28.85],
                        [76.85, 28.35]
                    ]]
                },
                "onset": (now - datetime.timedelta(minutes=10)).isoformat(),
                "expires": (now + datetime.timedelta(hours=2)).isoformat(),
                "is_active": True,
                "impacted_infrastructure": impacted_names[:4]
            })

        if any(a["category"] == "AIRPORT" for a in threatened_assets):
            alerts.append({
                "alert_id": f"CAP-IN-ATC-DEL-{now.strftime('%Y%m%d%H%M')}-02",
                "severity": "SEVERE",
                "event_type": "AVIATION_MICROBURST_SHEAR",
                "headline": "ORANGE WARNING: IGI Airport Terminal Runway Shear & Convective Squall",
                "description": "Severe storm cell track directly intersects IGI Airport terminal airspace with ETA < 15 minutes.",
                "instruction": "Execute Ground Stop and runway microburst defense protocols.",
                "area_desc": "IGI Airport (DEL) & Palam Sector",
                "polygon_geojson": CRITICAL_ASSETS[0]["polygon_geojson"],
                "onset": now.isoformat(),
                "expires": (now + datetime.timedelta(hours=1)).isoformat(),
                "is_active": True,
                "impacted_infrastructure": ["Indira Gandhi International Airport (DEL)"]
            })

        return alerts

    def get_active_alerts(self, lat: float = 28.6139, lon: float = 77.2090) -> List[WeatherAlert]:
        """Returns currently active georeferenced severe weather alerts."""
        now = datetime.datetime.now(datetime.timezone.utc)
        return [
            WeatherAlert(
                alert_id="CAP-IN-IMD-2026-0929-001",
                severity="EXTREME",
                event_type="LIGHTNING_AND_SQUALL",
                headline="RED ALERT: Severe Thunderstorm with Intense Lightning & Squall (>70 km/h)",
                description=(
                    "Doppler Weather Radar and Satellite Nowcasting models indicate intense convective clusters "
                    "approaching NCR region with cloud top reflectivity >55 dBZ and extreme cloud-to-ground lightning risk."
                ),
                instruction="Seek immediate sturdy shelter. Stay away from open fields, tall trees, power lines, and water bodies.",
                area_desc="Delhi NCR, Noida, Ghaziabad, Gurugram, Faridabad",
                polygon_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [76.85, 28.35],
                        [77.45, 28.35],
                        [77.50, 28.85],
                        [76.80, 28.85],
                        [76.85, 28.35]
                    ]]
                },
                onset=now - datetime.timedelta(minutes=15),
                expires=now + datetime.timedelta(hours=2),
                is_active=True,
                impacted_infrastructure=[
                    "Indira Gandhi International Airport (DEL)",
                    "AIIMS New Delhi & Apex Trauma Center",
                    "Delhi 400kV Bawana / Rohini Super Power Grid"
                ]
            ),
            WeatherAlert(
                alert_id="CAP-IN-IMD-2026-0929-002",
                severity="SEVERE",
                event_type="HEAVY_PRECIPITATION",
                headline="ORANGE WARNING: Intense Cloudburst-like Downpour Expected",
                description="Localized rain rates exceeding 45 mm/hr detected along storm track vectors for next 60 minutes.",
                instruction="Avoid waterlogged underpasses and low-lying roadways.",
                area_desc="East Delhi & Western Uttar Pradesh Border",
                polygon_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [77.25, 28.55],
                        [77.60, 28.55],
                        [77.60, 28.90],
                        [77.25, 28.90],
                        [77.25, 28.55]
                    ]]
                },
                onset=now,
                expires=now + datetime.timedelta(hours=1, minutes=30),
                is_active=True,
                impacted_infrastructure=[
                    "Maharani Bagh 220kV Transmission Substation",
                    "Rajiv Chowk Metro Transit Interchange Hub"
                ]
            )
        ]


alert_service = AlertService()
