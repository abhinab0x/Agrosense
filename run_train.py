import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Setup absolute system directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'Crop_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'saved_agro_model.pkl')

print(" Checking your project path layout...")
if not os.path.exists(DATASET_PATH):
    print(f"❌ ERROR: 'Crop_data.csv' was not found at: {DATASET_PATH}")
    exit()

print(" Dataset found! Reading matrix rows...")
df = pd.read_csv(DATASET_PATH)

# --- TARGETED METRIC SELECTION ---
# We isolate the 6 parameters your ESP32 streams to prevent matching failures!
found_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'soil_moisture']
target_column = 'crop_type'

print(f" Features locked to: {found_features}")
print(f"  Target prediction column locked to: '{target_column}'")

X = df[found_features]
y = df[target_column]

# Split the dataset matrix (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(" Training Random Forest Crop Recommendation Engine...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Calculate system prediction score accuracy
accuracy = model.score(X_test, y_test)
print(f" Training complete! Target Accuracy: {accuracy * 100:.2f}%")

# Export trained binary payload 
joblib.dump(model, MODEL_PATH)
print(f"\n SUCCESS: Accurate model brain serialized and saved to:\n   {MODEL_PATH}")