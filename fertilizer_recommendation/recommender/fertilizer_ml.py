from pathlib import Path

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "ml" / "fertilizer_pipeline.pkl"

DEFAULT_FIELDS = {
    "rainfall": 100,
    "organic_matter": 5,
    "crop_type": "rice",
    "soil_type": "Loamy Soil",
}


def ml_fertilizer_prediction(data: dict) -> dict:
    if not MODEL_PATH.exists():
        return {
            "status": "error",
            "message": "Model file not found. Train the model first using: python ml/train_fertilizer_model.py",
        }

    payload = {
        "N": data.get("N"),
        "P": data.get("P"),
        "K": data.get("K"),
        "ph": data.get("ph", data.get("pH")),
        "soil_moisture": data.get("soil_moisture"),
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
    }
    payload.update(DEFAULT_FIELDS)

    # Allow callers to override the optional defaults when they have richer data.
    for key in DEFAULT_FIELDS:
        if key in data and data[key] not in (None, ""):
            payload[key] = data[key]

    model = joblib.load(MODEL_PATH)
    input_frame = pd.DataFrame([payload])

    prediction = model.predict(input_frame)[0]
    result = {
        "status": "success",
        "fertilizer": str(prediction),
    }

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(input_frame)[0]
        result["confidence"] = round(float(max(probabilities)), 4)

    return result
