# run_train.py  — located at AGROSENSE_MAIN/Agrosense/run_train.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib, os

BASE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'agrosense-backend')
CSV    = os.path.join(BASE, 'Crop_data.csv')
SAVE   = os.path.join(BASE, 'telemetry', 'saved_agro_model.pkl')

df = pd.read_csv(CSV)
print("Columns found:", list(df.columns))

# Use exactly these 7 features — must match what ESP32 sends
FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'soil_moisture']
TARGET   = 'crop_type'

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

acc = model.score(X_test, y_test)
print(f" Accuracy: {acc * 100:.2f}%")
print(f" Features: {model.n_features_in_}")

joblib.dump(model, SAVE)
print(f" Saved to: {SAVE}")

# Sanity test
print("Test prediction:", model.predict([[90, 42, 43, 24.2, 80.3, 6.5, 35.0]]))