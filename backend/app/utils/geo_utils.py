import math
from typing import Tuple, List, Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in kilometers.
    """
    R = 6371.0  # Earth's radius in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def create_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Generate min_lat, min_lon, max_lat, max_lon given center and radius.
    """
    lat_delta = radius_km / 110.574
    lon_delta = radius_km / (111.320 * math.cos(math.radians(lat)))

    min_lat = lat - lat_delta
    max_lat = lat + lat_delta
    min_lon = lon - lon_delta
    max_lon = lon + lon_delta

    return min_lat, min_lon, max_lat, max_lon


def generate_grid_points(
    min_lat: float, min_lon: float, max_lat: float, max_lon: float, step_deg: float = 0.05
) -> List[Dict[str, float]]:
    """Generate geospatial sampling grid points."""
    points = []
    lat = min_lat
    while lat <= max_lat:
        lon = min_lon
        while lon <= max_lon:
            points.append({"latitude": round(lat, 4), "longitude": round(lon, 4)})
            lon += step_deg
        lat += step_deg
    return points
