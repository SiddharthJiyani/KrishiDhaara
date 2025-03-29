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
import time
import pymongo

mongo_client = pymongo.MongoClient("mongodb+srv://shivlumewada:b9EHHbCAVy8XUKq2@cluster0.6u346.mongodb.net")
water_usage_db = mongo_client["test"]
usage_collection = water_usage_db["waterusagedatas"]

WATER_FLOW_RATE = 3 #litre/minutes

app = Flask(__name__)

cred1 = credentials.Certificate("firebase_config.json")
prim_app = firebase_admin.initialize_app(cred1, {
    'databaseURL': 'https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app/' 
})

cred2 = credentials.Certificate("smart-irrigation-water-usage-firebase-config.json")
sec_app = firebase_admin.initialize_app(cred2, {
    'databaseURL': 'https://smart-irrigation-water-usage-default-rtdb.asia-southeast1.firebasedatabase.app/' 
},name='secondary')

@app.route("/")
def hello_world():
    return f"Welcome to Krishi Dhara Smart Irrigration System AI!"

@app.route('/predict_verdict', methods=['POST'])
async def verdict_endpoint():
    try:
        data = request.json
        result = predict_verdict(
            temperature=data['temperature'],
            humidity=data['humidity'],
            hour=data['hour'],
        )
        
        relayNumber=data['relayNumber']
        stats_ref = db.reference(f"relay-sensors-suggestion/{relayNumber}/state",app=prim_app)
        
        water_usage_ref = db.reference(f"water-usage-stats/{relayNumber}",app=sec_app)
        
        current_data = water_usage_ref.get() or {"state": "off", "timestamp": 0}
        current_state = current_data.get("state", "off")
        start_timestamp = current_data.get("timestamp", 0)
        # print(current_data)
        
        if result=="Off":
            output="off"
        else:
            output="on"
            
        # Only calculate and store water usage when turning off an active relay
        if current_state == "on" and output == "off":
            end_timestamp = int(time.time())
            duration_seconds = end_timestamp - start_timestamp
            duration_minutes = duration_seconds / 60  # Convert to minutes
            water_used = duration_minutes * WATER_FLOW_RATE  # Liters
            
            # Store water usage data in MongoDB only when we have usage to record
            usage_record = {
                "relayNumber": relayNumber,
                "startTimestamp": start_timestamp,
                "endTimestamp": end_timestamp,
                "durationMinutes": duration_minutes,
                "waterUsageLiters": water_used,
                "recordedAt": datetime.now()
            }
            usage_collection.insert_one(usage_record)
        
        # Update Firebase with new state and timestamp
        current_timestamp = int(time.time())
        water_usage_ref.set({
            "state": output,
            "timestamp": current_timestamp #if output == "on" else start_timestamp
        })
        
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