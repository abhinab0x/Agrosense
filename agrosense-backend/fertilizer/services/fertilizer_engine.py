import os
import joblib

# Root of the Django project (agrosense-backend/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, 'telemetry', 'saved_fertilizer_model.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'telemetry', 'fertilizer_encoder.pkl')

_model = None
_encoder = None


def _load_artifacts():
    """Lazy-load the model and encoder once, and cache them."""
    global _model, _encoder
    if _model is None or _encoder is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        if not os.path.exists(ENCODER_PATH):
            raise FileNotFoundError(f"Encoder file not found at {ENCODER_PATH}")
        _model = joblib.load(MODEL_PATH)
        _encoder = joblib.load(ENCODER_PATH)
    return _model, _encoder


def get_fertilizer_prediction(n, p, k, temp, hum, ph, moisture):
    model, encoder = _load_artifacts()

    input_data = [[float(n), float(p), float(k), float(temp), float(hum), float(ph), float(moisture)]]
    encoded_val = model.predict(input_data)[0]

    return encoder.inverse_transform([encoded_val])[0]