import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os

def train_model():
    
    if not os.path.exists('fertilizer/data'):
        os.makedirs('fertilizer/data')
    
    
    df = pd.read_csv('fertilizer/data/crop_data.csv')
    
   
    le_soil = LabelEncoder()
    le_crop = LabelEncoder()
    le_irrigation = LabelEncoder()
    
  
    df['soil_type'] = le_soil.fit_transform(df['soil_type'])
    df['crop_type'] = le_crop.fit_transform(df['crop_type'])
    df['irrigation_method'] = le_irrigation.fit_transform(df['irrigation_method'])
    
    joblib.dump(le_soil, 'fertilizer/le_soil.pkl')
    joblib.dump(le_crop, 'fertilizer/le_crop.pkl')
    joblib.dump(le_irrigation, 'fertilizer/le_irrigation.pkl')
    
   
    X = df.drop(columns=['fertilizer_type'])
    y = df['fertilizer_type']
    
  
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)
    joblib.dump(model, 'fertilizer/model.pkl')
    print("Training complete. Model and encoders saved.")

if __name__ == "__main__":
    train_model()