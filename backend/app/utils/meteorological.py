import math
from typing import Tuple


def dbz_to_rain_rate(dbz: float, a: float = 200.0, b: float = 1.6) -> float:
    """
    Marshall-Palmer Z-R relationship:
    Z = a * (R ** b) -> R = (10^(dBZ/10) / a)^(1/b) in mm/hr.
    Standard convective parameters: a=300, b=1.4; Stratiform: a=200, b=1.6.
    """
    if dbz < 5.0:
        return 0.0
    z_linear = 10.0 ** (dbz / 10.0)
    rain_rate = (z_linear / a) ** (1.0 / b)
    return round(float(rain_rate), 2)


def rain_rate_to_dbz(rain_rate_mm_hr: float, a: float = 200.0, b: float = 1.6) -> float:
    """Calculate radar reflectivity factor in dBZ from rain rate."""
    if rain_rate_mm_hr <= 0.01:
        return 0.0
    z_linear = a * (rain_rate_mm_hr ** b)
    dbz = 10.0 * math.log10(z_linear)
    return round(float(dbz), 1)


def calculate_lightning_risk_index(
    dbz: float,
    cape_j_kg: float,
    cloud_top_temp_c: float,
    vil_kg_m2: float
) -> Tuple[float, str]:
    """
    Empirical multi-parameter lightning risk index (0.0 - 1.0) and severity rating.
    Factors:
    - High Radar Reflectivity (>40 dBZ indicates mixed-phase graupel/hail)
    - High CAPE (>1500 J/kg indicates strong vertical updrafts)
    - Cold Cloud Top Temp (<-40 C indicates deep convection reaching tropopause)
    - High VIL (>15 kg/m2 indicates heavy liquid/ice water content)
    """
    # Normalized score components
    dbz_score = max(0.0, min(1.0, (dbz - 25.0) / 30.0))  # 25-55 dBZ
    cape_score = max(0.0, min(1.0, (cape_j_kg - 500.0) / 2500.0))  # 500-3000 J/kg
    temp_score = max(0.0, min(1.0, (-cloud_top_temp_c - 10.0) / 50.0))  # -10C to -60C
    vil_score = max(0.0, min(1.0, (vil_kg_m2 - 5.0) / 25.0))  # 5-30 kg/m2

    # Weighted combination
    composite_prob = (
        0.35 * dbz_score +
        0.30 * cape_score +
        0.20 * temp_score +
        0.15 * vil_score
    )
    composite_prob = round(float(max(0.0, min(1.0, composite_prob))), 3)

    return composite_prob, get_severity_class(composite_prob)


def get_severity_class(probability: float) -> str:
    if probability >= 0.75:
        return "CRITICAL"
    elif probability >= 0.50:
        return "HIGH"
    elif probability >= 0.25:
        return "MODERATE"
    else:
        return "LOW"
