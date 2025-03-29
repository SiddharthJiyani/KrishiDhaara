import joblib
import numpy as np

# Load the trained model
model = joblib.load('Verdict_Prediction/verdict.pkl')

def predict_verdict(temperature, humidity, hour):
    # Preprocess hour into cyclic features
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    
    # Create input array
    input_data = [[temperature, humidity, hour_sin, hour_cos]]
    
    # Predict
    prediction = model.predict(input_data)
    return "On" if prediction[0] == 1 else "Off"