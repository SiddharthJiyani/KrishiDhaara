import firebase_admin
import time
from datetime import datetime
import requests
import board
import adafruit_dht
import sys
from firebase_admin import credentials
from firebase_admin import db
import RPi.GPIO as GPIO
import threading

# GPIO Pin Configuration
RELAY_PIN = 22
SOIL_MOISTURE_PIN = 27

# Initialize GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)
GPIO.setup(SOIL_MOISTURE_PIN, GPIO.IN)

# Initialize DHT11 temperature/humidity sensor
dht_sensor = adafruit_dht.DHT11(board.D17)
print('Temperature sensor initialized:', dht_sensor)

# Firebase Configuration
authDomain = "smartirrigation-1f48f.firebaseapp.com"
databaseURL = "https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app"
projectId = "smartirrigation-1f48f"
storageBucket = "smartirrigation-1f48f.firebasestorage.app"
appId = "1:859711317799:web:8f9f696e5fe0ecd6766b02"
ref_path = 'relay-sensors/relay1/state'

# Initialize Firebase
cred = credentials.Certificate('firebase_config.json')
firebase_admin.initialize_app(cred, {
    'database': f'https://{projectId}.firebaseio.com/'
})
print('Firebase initialized successfully')

# Server URLs
TEMPERATURE_URL = "https://irrigation-node-backend.vercel.app/SensorData/temperature/upload"
MOISTURE_URL = "https://irrigation-node-backend.vercel.app/SensorData/humidity/upload"
VERDICT_URL= "https://shivang24-soil-prediction-api.hf.space/predict_verdict"
ANOMALY_URL= "https://shivang24-soil-prediction-api.hf.space/detect_anomaly"



# Configuration for sensor readings
MAX_RETRIES = 10
RETRY_DELAY = 2  # seconds 
SERVER_POST_INTERVAL = 30  # seconds - post to server every minute
SENSOR_READ_INTERVAL = 10   # seconds - read sensors every 5 seconds

# Global variables to store the latest readings
current_temperature = None
current_humidity = None
current_soil_moisture = None
pump_state = "off"  # Initialize pump as off
last_server_post_time = 0

# Function to control relay/pump
def pump_on():
    GPIO.output(RELAY_PIN, GPIO.LOW)  # Activate Relay
    print("Pump turned ON")

def pump_off():
    GPIO.output(RELAY_PIN, GPIO.HIGH)   # Deactivate Relay
    print("Pump turned OFF")

# Function to handle Firebase data changes
def on_relay_change(event):
    global pump_state
    if event.data:  # Check if data exists
        print(f"Relay1 current state from Firebase: {event.data}")
        pump_state = event.data
       
        # Control pump based on Firebase state
        if event.data == "on":
            pump_on()
        else:
            pump_off()

# Function to read soil moisture
def read_soil_moisture():
    moisture = GPIO.input(SOIL_MOISTURE_PIN)
    moisture_status = "dry" if moisture == 1 else "moist"
    print(f'Soil is {moisture_status}')
    return moisture

# Function to get temperature and humidity with retry mechanism
def get_sensor_readings():
    for attempt in range(MAX_RETRIES):
        try:
            temperature = dht_sensor.temperature
            humidity = dht_sensor.humidity
            return temperature, humidity
        except RuntimeError as error:
            # This is the common error - just retry after delay
            print(f"Temperature reading failed (attempt {attempt+1}/{MAX_RETRIES}): {error}")
            time.sleep(RETRY_DELAY)
        except Exception as e:
            # For other errors, print and re-raise
            print(f"Unexpected error in temperature sensor: {e}")
            # Continue rather than raising to keep the program running
            break
   
    # If we get here, all retries failed
    return None, None

# Function to post temperature to server
def post_temperature(sensor_number, temperature, units="celsius"):
    url = TEMPERATURE_URL
    payload = {
        "sensorNumber": sensor_number,
        "units": units,
        "temperature": temperature
    }

    try:
        response = requests.post(url, json=payload)
        print(f"Temperature data posted: {temperature}°C - Response: {response.status_code}")
        return response.status_code
    except Exception as e:
        print("Error posting temperature data:", e)
        return None

# Function to post moisture to server
def post_moisture(sensor_number, humidity, units="percent"):
    url = MOISTURE_URL
    payload = {
        "sensorNumber": sensor_number,
        "units": units,
        "humidity": humidity
    }

    try:
        response = requests.post(url, json=payload)
        print(f"Humidity data posted: {humidity}% - Response: {response.status_code}")
        return response.status_code
    except Exception as e:
        print("Error posting moisture data:", e)
        return None

# Function to post temperature to server
def post_relay(temperature, humidity):
    url = VERDICT_URL
    curHour = datetime.now().hour
    payload = {
        "relayNumber": "relay1",
        "temperature": temperature,
        "humidity": humidity,
        "hour": curHour
    }

    try:
        response = requests.post(url, json=payload)
        print(f"verdict prediction data posted: {temperature}°C, humidity={humidity}% - Response: {response.status_code}")
        return response.status_code
    except Exception as e:
        print("Error posting verdict data:", e)
        return None

# Function to post temperature to server
def post_anomaly(temperature, humidity):
    url = ANOMALY_URL
    curHour = datetime.now().hour
    payload = {
        "temperature": temperature,
        "humidity": humidity,
        "hour": curHour
    }

    try:
        response = requests.post(url, json=payload)
        print(f"Anomaly Detection data posted: {temperature}°C, humidity={humidity}% - Response: {response.status_code}")
        return response.status_code
    except Exception as e:
        print("Error posting Anomaly data:", e)
        return None
    
# Smart irrigation logic function - MODIFIED to only update Firebase, not directly control pump
def check_irrigation_needs():
    global pump_state
   
    soil_moisture = read_soil_moisture()
   
    # If soil is dry (reading=1) and pump is not already on, request pump on via Firebase
    if soil_moisture == 1 and pump_state != "on":
        print("Soil is dry - requesting irrigation via Firebase")
        try:
            relay_ref.set("on")  # This will trigger the Firebase listener
        except Exception as e:
            print(f"Error updating Firebase: {e}")
    # If soil is wet and pump is on, request pump off via Firebase
    elif soil_moisture == 0 and pump_state == "on":
        print("Soil is sufficiently moist - requesting irrigation stop via Firebase")
        try:
            relay_ref.set("off")  # This will trigger the Firebase listener
        except Exception as e:
            print(f"Error updating Firebase: {e}")

# Function to read all sensors
def read_all_sensors():
    global current_temperature, current_humidity, current_soil_moisture, last_server_post_time
   
    while True:
        try:
            # Read temperature and humidity
            temp, humidity = get_sensor_readings()
            if temp is not None and humidity is not None:
                current_temperature = temp
                current_humidity = humidity
                print(f'Temperature: {temp}°C, Humidity: {humidity}%')
           
            # Read soil moisture
            current_soil_moisture = read_soil_moisture()
           
            # Check if we need to control irrigation
            check_irrigation_needs()
           
            # Post to server every SERVER_POST_INTERVAL seconds
            current_time = time.time()
            if current_time - last_server_post_time >= SERVER_POST_INTERVAL:
                if current_temperature is not None:
                    post_temperature("temp1", current_temperature)
                if current_humidity is not None:
                    post_moisture("soilmoist1", current_humidity)
                if current_humidity is not None and current_temperature is not None:
                    post_relay(current_temperature, current_humidity)
                    post_anomaly(current_temperature, current_humidity)

                last_server_post_time = current_time
           
            # Wait before next reading
            time.sleep(SENSOR_READ_INTERVAL)
           
        except KeyboardInterrupt:
            print("Sensor reading interrupted")
            break
        except Exception as e:
            print(f"Error in sensor reading loop: {e}")
            # Continue to keep the program running
            time.sleep(SENSOR_READ_INTERVAL)

# Main function - MODIFIED to ensure pump control only happens via Firebase
def main():
    try:
        # Set up reference to the specific relay node in Firebase
        global relay_ref
        relay_ref = db.reference(path=ref_path, url=databaseURL)
       
        # Attach the listener to Firebase - this is now the ONLY way to control the pump
        relay_ref.listen(on_relay_change)
        print("Listening for changes to relay1 from Firebase...")
       
        # Get initial pump state from Firebase and force an update to ensure listener handles it
        try:
            initial_state = relay_ref.get()
            print(f"Initial pump state from Firebase: {initial_state}")
            # This will trigger the listener which will then control the pump
            relay_ref.set(initial_state)
        except Exception as e:
            print(f"Error getting initial pump state: {e}")
            # Default to off if there's an error, using Firebase to trigger the listener
            relay_ref.set("off")
       
        # Start sensor reading thread
        sensor_thread = threading.Thread(target=read_all_sensors)
        sensor_thread.daemon = True
        sensor_thread.start()
       
        # Keep the main thread alive
        while True:
            time.sleep(1)
           
    except KeyboardInterrupt:
        print("Program interrupted by user")
    except Exception as e:
        print(f"Unexpected error in main function: {e}")
    finally:
        # Clean up
        print("Cleaning up resources")
        try:
            dht_sensor.exit()
        except Exception as e:
            pass
        GPIO.cleanup()
        sys.exit(0)

if __name__ == "__main__":
    main()