import os
import joblib

# Automatically map possible locations for the model brain file
POSSIBLE_PATHS = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'saved_agro_model.pkl'), # Inside telemetry/
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'saved_agro_model.pkl'), # Inside agrosense-backend/
    os.path.abspath('saved_agro_model.pkl') # Root execution folder
]

def get_live_prediction(n, p, k, temp, hum, ph):
    """
    Accepts incoming real-time sensor metrics from views.py, processes 
    them through the saved ML model brain, and returns the predicted crop.
    """
    model_path = None
    
    # Scan locations until we find the generated .pkl file
    for path in POSSIBLE_PATHS:
        if os.path.exists(path):
            model_path = path
            break

    # If the file is truly missing, return a descriptive error string instead of crashing
    if not model_path:
        print("❌ CRITICAL: 'saved_agro_model.pkl' could not be found by Django.")
        return "Machine learning model file is missing or corrupted on the server."

    try:
        # Load the trained Random Forest algorithm structure from memory
        model = joblib.load(model_path)
        
        # Structure incoming values into a matching 2D array format for Scikit-Learn
        input_features = [[float(n), float(p), float(k), float(temp), float(hum), float(ph)]]
        
        # Execute prediction matrix calculation
        prediction = model.predict(input_features)[0]
        return str(prediction)
        
    except Exception as e:
        print(f"❌ PREDICTION ERROR: {str(e)}")
        return "Calculation Engine Error"