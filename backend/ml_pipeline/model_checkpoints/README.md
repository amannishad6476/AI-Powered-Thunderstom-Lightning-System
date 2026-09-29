# ML Model Checkpoints Directory

This directory stores pre-trained neural network weights and serialized ONNX/PyTorch model artifacts for the AI Nowcasting System.

### Recommended Model Formats:
1. `convlstm_radar_nowcast.onnx` - Spatiotemporal ConvLSTM / UNet for 0-2hr radar reflectivity prediction.
2. `lightning_risk_xgb.onnx` / `.pkl` - XGBoost / LightGBM multi-sensor classifier for lightning strike probability.
3. `cell_tracker_weights.pt` - Deep learning convective storm cell detection and track trajectory model.

Models can be downloaded from the training pipeline or loaded automatically by `app/services/ai_inference.py`.
