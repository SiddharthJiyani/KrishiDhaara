import os
import warnings
warnings.filterwarnings("ignore", category=UserWarning, message=".*development server.*")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def hello_world():
    return f"Welcome to Krishi Dhara Smart Irrigration System AI!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)