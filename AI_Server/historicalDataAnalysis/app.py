import os
import warnings
warnings.filterwarnings("ignore", category=UserWarning, message=".*development server.*")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify
from Verdict_Prediction.verdict_response import predict_verdict
from Anomaly_Detection.anomaly_detection import detector
from Feature_Forecasting.forecasting_response import forecaster
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)

cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app/' 
})


@app.route("/")
def hello_world():
    return f"Welcome to Krishi Dhara Smart Irrigration System AI!"

@app.route('/predict_verdict', methods=['POST'])
def verdict_endpoint():
    try:
        data = request.json
        result = predict_verdict(
            temperature=data['temperature'],
            humidity=data['humidity'],
            hour=data['hour'],
        )
        
        relayNumber=data['relayNumber']
        stats_ref = db.reference(f"relay-sensors-suggestion/{relayNumber}/state")
     
        if(result=="Off"):
            output="off"
        else:
            output="on"
        
        stats_ref.set(output)
        
        return jsonify({"verdict": result})
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400

@app.route('/detect_anomaly', methods=['POST'])
def anomaly_endpoint():
    try:
        data = request.json
        anomalies = detector.detect(
            hour=data['hour'],
            temperature=data['temperature'],
            humidity=data['humidity']
        )
        return jsonify({
            "temperature_anomaly": bool(anomalies["temperature"]),
            "humidity_anomaly": bool(anomalies["humidity"])
        })
    except ValueError as e:
        return jsonify({"error": "Invalid timestamp format"}), 400
    
@app.route('/forecast', methods=['GET'])
def get_forecast():
    try:
        forecast_data = forecaster.generate_forecast()
        return jsonify({
            "forecast": forecast_data.to_dict(orient='records'),
            "generated_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import uvicorn
    from asgiref.wsgi import WsgiToAsgi
    
    asgi_app = WsgiToAsgi(app)
    uvicorn.run(asgi_app, host="0.0.0.0", port=7860)