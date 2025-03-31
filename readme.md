# 🌱 KrishiDhaara: Smart Agriculture Platform

<div align="center">

### *Revolutionizing Agriculture with AI, IoT, and Data Analytics*

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/s2302dVRVlo)

</div>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

## 🌾 Overview

**KrishiDhaara** is a comprehensive smart agriculture platform built to empower farmers with cutting-edge technology. By seamlessly integrating IoT sensors, AI-powered analytics, and intelligent automation, KrishiDhaara transforms traditional farming practices into precise, data-driven operations that improve crop yields, conserve resources, and detect problems before they affect harvests.

Our platform bridges the technology gap in agriculture, making sophisticated tools accessible to farmers of all scales through an intuitive interface available in both English and Hindi. KrishiDhaara addresses the key challenges farmers face daily: irrigation management, disease detection, weather uncertainties, and resource optimization.

## ✨ Key Features

### 💧 Smart Irrigation System
- **Real-time soil moisture monitoring** with precise sensor data visualization
- **Automated irrigation scheduling** based on soil conditions and weather forecasts
- **Water consumption analytics** with filterable date ranges and usage patterns
- **Anomaly detection** for identifying leaks and system malfunctions
- **Interactive irrigation history** with detailed session logs (duration, volume, timestamps)

### 🌿 AI-Powered Plant Disease Detection
- **Disease identification** with 99.09% accuracy using ResNet50 model
- **Fast API with Hugging Face integration** for seamless processing
- **Early detection alerts** before diseases spread throughout crops
- **Treatment recommendations** with severity assessment
- **Historical tracking** of disease occurrences and treatments

### 🗺️ Precision Field Mapping
- **GPS-accurate field visualization** with custom boundary definition
- **Sensor positioning and management** throughout mapped fields
- **Real-time sensor status indicators** directly on field map
- **Map/satellite view switching** for comprehensive field visualization
- **React-Leaflet integration** for high-precision mapping
- **Mobile-friendly interface** for in-field use and adjustments

### ☁️ Weather Intelligence
- **Open weather API integration** for localized forecasting
- **7-day detailed forecasts** with hourly predictions
- **Wind speed and precipitation data** for farming operations planning
- **Weather-based irrigation adjustments** to optimize water usage
- **Historical weather pattern analysis** for seasonal planning

### 🤖 Intelligent Farm Assistant Chatbot
- **GROQ API integration** for natural language understanding
- **Farming-specific context** for relevant advice and information
- **AI hallucination detection** with expert review suggestions
- **Multi-language support** (English and Hindi)
- **Query routing** to specialized knowledge domains (irrigation, diseases, weather)

### 📊 Comprehensive Analytics Dashboard
- **Centralized overview** of all farm operations and sensor data
- **Multi-timeframe visualization** (daily, monthly, yearly views)
- **Sensor performance monitoring** and maintenance alerts
- **Customizable reports** for complete farm analysis
- **Responsive design** for desktop and mobile access

### 🚨 Advanced Anomaly Detection
- **Real-time AI-powered notifications** for unusual patterns
- **LSTM model implementation** for predictive analysis
- **Configurable alert thresholds** with on/off toggles
- **Historical anomaly tracking** for pattern recognition

### 🌱 Crop Recommendation System
- **AI-trained model** for optimal crop selection
- **Soil-specific recommendations** based on sensor data
- **Seasonal planting advice** integrated with weather forecasts
- **Yield prediction** based on historical data and conditions

### 📰 Agricultural News & Resources
- **Krishi Jagran integration** via web scraping
- **Categorized agricultural news** with custom filtering
- **Featured articles** highlighting important developments
- **Pagination system** for easy content browsing

### 🔮 Additional Smart Features
- **Hindi <-> English translation** throughout the entire platform
- **QR-accessible care tips** for in-field reference
- **Report generation** for comprehensive farm analysis
- **Responsive design** for all devices and screen sizes

## 🛠️ Tech Stack

<div align="center">
  
### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![React Leaflet](https://img.shields.io/badge/React_Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### Mobile Application
![Kotlin](https://img.shields.io/badge/Kotlin-0095D5?style=for-the-badge&logo=kotlin&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-4285F4?style=for-the-badge&logo=jetpack-compose&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

### AI and IoT
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFCB2D?style=for-the-badge)
![GROQ](https://img.shields.io/badge/GROQ-01A9DB?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry_Pi-A22846?style=for-the-badge&logo=raspberry-pi&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)

</div>

## 🏗️ Architecture

KrishiDhaara follows a modular microservices architecture consisting of five key components:

1. **Web Client**: React-based responsive dashboard that provides visualization, control center, and user management
2. **Mobile App**: Kotlin-based Android application that enables on-field monitoring, control, and disease detection
3. **IoT Server**: Python-based middleware that handles sensor communications, data processing, and automation
4. **AI Server**: Specialized service for disease detection, anomaly detection, and intelligent data analysis
5. **Backend Server**: Core application logic, database management, and API gateway services

This architecture ensures scalability, maintainability, and fault tolerance across the platform.

## 🎥 Demo
<div align="center">
    <a href="https://youtu.be/s2302dVRVlo">
        <img src="https://img.youtube.com/vi/s2302dVRVlo/maxresdefault.jpg" alt="KrishiDhaara Demo Video" width="600" />
    </a>
    <p><em>Check out our comprehensive demonstration video on YouTube</em></p>
</div>

## 📲 Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MongoDB
- Android Studio (for mobile app)
- IoT sensors (see hardware specifications in docs)

### Step-by-Step Setup

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/KrishiDhaara.git
cd KrishiDhaara
```

#### 2. Web Client Setup
```bash
cd client
npm install
npm run dev
```

#### 3. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

#### 4. IoT Server Setup
```bash
cd IoT_Server
pip install -r requirements.txt
python index.py
```

#### 5. AI Server Setup
```bash
cd AI_Server/diseaseDetectionServer
pip install -r requirements.txt
python app.py
```

#### 6. Mobile App Setup
```bash
cd mobileApp
# Open in Android Studio and build the project
```

## 📋 Usage

1. **Initial Configuration**:
   - Set up your farm's geographical details
   - Connect and position IoT sensors
   - Define crop types and field boundaries

2. **Daily Monitoring**:
   - Check dashboard for real-time soil moisture, temperature, and other sensor readings
   - Review weather forecasts for upcoming farming operations
   - Monitor anomaly notifications for potential issues

3. **Disease Detection**:
   - Upload plant images through web or mobile app
   - Review AI analysis results for disease identification
   - Implement recommended treatments if issues are detected

4. **Irrigation Management**:
   - Monitor soil moisture levels across fields
   - Adjust automated irrigation schedules or trigger manual irrigation
   - Analyze water usage patterns to optimize consumption

5. **Insights & Planning**:
   - Generate custom reports for farm operations
   - Use crop recommendation system for planting decisions
   - Leverage chatbot for farming advice and troubleshooting


## 🤝 Contributing

We welcome contributions from the community! Whether it's adding new features, fixing bugs, improving documentation, or sharing ideas, your input is valuable.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please check out our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgements

- [Firebase](https://firebase.google.com/) for real-time database capabilities
- [Groq](https://groq.com/) for AI language processing
- [React](https://reactjs.org/) for the web frontend framework
- [Jetpack Compose](https://developer.android.com/jetpack/compose) for modern Android UI
- [OpenWeather](https://openweathermap.org/) for weather data integration
- [Krishi Jagran](https://krishijagran.com/) for agricultural news content
- [TensorFlow](https://www.tensorflow.org/) and [PyTorch](https://pytorch.org/) for AI model training
---

<div align="center">
  
### 🌾 Made with ❤️ for India's Farmers 🌾

<p>KrishiDhaara - Where Technology Meets Agriculture</p>

[Report Bug](https://github.com/SiddharthJiyani/KrishiDhaara/issues) · [Request Feature](https://github.com/SiddharthJiyani/KrishiDhaara/issues)

</div>