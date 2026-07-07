import os
import joblib


MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_agro_model.pkl')

FEATURE_ORDER = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'soil_moisture']

def get_live_prediction(n, p, k, temp, hum, ph, moisture):
    if not os.path.exists(MODEL_PATH):
        print(f" Model not found at: {MODEL_PATH}")
        return None

    try:
        model = joblib.load(MODEL_PATH)

        
        expected = model.n_features_in_
        print(f"  Model expects {expected} features — sending 7")

        if expected != 7:
            print(f"  Mismatch! Model needs {expected} but we send 7. Retrain the model.")
            return None

        prediction = model.predict([[
            float(n), float(p), float(k),
            float(temp), float(hum),
            float(ph), float(moisture)
        ]])[0]

        print(f"Predicted crop: {prediction}")
        return str(prediction)

    except Exception as e:
        print(f" PREDICTION ERROR: {str(e)}")
        return None