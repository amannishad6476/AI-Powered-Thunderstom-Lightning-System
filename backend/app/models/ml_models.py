from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any, List


class ModelType(str, Enum):
    CONV_LSTM = "ConvLSTM_Radar_Nowcaster"
    UNET_PRECIP = "UNet_Precipitation_Extrapolator"
    LIGHTNING_XGB = "XGBoost_Lightning_Classifier"
    DEEP_TRACKER = "Convective_Cell_Tracker"


class MLModelInfo(BaseModel):
    model_id: str
    name: str
    model_type: ModelType
    version: str
    lead_time_range_min: List[int]
    input_features: List[str]
    spatial_resolution_km: float
    temporal_resolution_min: int
    accuracy_metrics: Dict[str, float]
    status: str = "LOADED"


AVAILABLE_MODELS = {
    "radar_nowcast": MLModelInfo(
        model_id="convlstm_v2_1",
        name="Spatiotemporal ConvLSTM Reflectivity Predictor",
        model_type=ModelType.CONV_LSTM,
        version="2.1.0",
        lead_time_range_min=[15, 30, 45, 60, 90, 120],
        input_features=["radar_dbz_t0", "radar_dbz_t_10", "radar_dbz_t_20", "insat_tir1", "doppler_velocity"],
        spatial_resolution_km=0.5,
        temporal_resolution_min=10,
        accuracy_metrics={"CSI_35dBZ": 0.68, "HSS": 0.72, "RMSE": 3.4},
        status="ACTIVE"
    ),
    "lightning_nowcast": MLModelInfo(
        model_id="lightning_xgb_v1_4",
        name="Multi-Sensor Convective Lightning Strike Predictor",
        model_type=ModelType.LIGHTNING_XGB,
        version="1.4.2",
        lead_time_range_min=[15, 30, 45, 60],
        input_features=["CAPE", "CIN", "VIL", "Cloud_Top_Temp_TIR1", "Echo_Top_Height", "Past_Flash_Density"],
        spatial_resolution_km=1.0,
        temporal_resolution_min=5,
        accuracy_metrics={"AUC_ROC": 0.91, "POD": 0.85, "FAR": 0.18},
        status="ACTIVE"
    )
}
