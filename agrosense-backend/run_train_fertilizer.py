import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

BASE = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(BASE, 'Crop_data.csv')
MODEL_PATH = os.path.join(BASE, 'telemetry', 'saved_fertilizer_model.pkl')
ENCODER_PATH = os.path.join(BASE, 'telemetry', 'fertilizer_encoder.pkl')

df = pd.read_csv(CSV)

FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'soil_moisture']
TARGET = 'fertilizer_type'

le = LabelEncoder()
df[TARGET] = le.fit_transform(df[TARGET])

X = df[FEATURES]
y = df[TARGET]

model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
joblib.dump(le, ENCODER_PATH)

print(" Fertilizer model and encoder saved successfully!")