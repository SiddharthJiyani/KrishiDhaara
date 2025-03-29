import HumidityData from "../models/HumidityData.js"
import TemperatureData from "../models/TemeratureData.js"
import SensorList from "../models/sensorList.js"
import { ref, get, set, update } from "firebase/database";
import { firebase_db } from "../config/firebase.js"
import axios from "axios";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai"

class GeminiClientSingleton {
    constructor() {
        if (!GeminiClientSingleton.instance) {
            const apikey = process.env.GEMINI_APIKEY;
            GeminiClientSingleton.instance = new GoogleGenerativeAI(apikey);
        }
        return GeminiClientSingleton.instance;
    }
}

export const getLatest = async (req, res) => {
    try {
        const aggregate_pipeline = [
            {
                $sort: { timestamp: -1 }
            },
            {
                $limit: 1
            }
        ]
        let resultTemp = await TemperatureData.aggregate(aggregate_pipeline);
        let resultHumi = await HumidityData.aggregate(aggregate_pipeline);
        resultTemp = resultTemp[0]
        resultHumi = resultHumi[0]

        return res.status(200).send({ "success": true, "message": { resultTemp, resultHumi } })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const addSensorToList = async (req, res) => {
    try {
        const { sensorType } = req.params;
        const { sensorNumber } = req.body;

        if (!["temperature", "humidity", "relay"].includes(sensorType)) {
            return res.status(400).send({
                success: false,
                message: "Invalid sensor type. Must be temperature, humidity, or relay"
            });
        }
        let sensorList = await SensorList.findOne({ sensortype: sensorType });

        if (sensorList) {
            // If sensor number is not already in the list, add it
            if (!sensorList.sensors.includes(sensorNumber)) {
                sensorList.sensors.push(sensorNumber);
                await sensorList.save();
                return res.status(200).send({
                    success: true,
                    message: `Added sensor ${sensorNumber} to ${sensorType} list`
                });
            } else {
                return res.status(400).send({
                    success: false,
                    message: `Sensor ${sensorNumber} already exists in ${sensorType} list`
                });
            }
        } else {
            // Create a new sensor list for this type
            const newSensorList = new SensorList({
                sensortype: sensorType,
                sensors: [sensorNumber]
            });

            await newSensorList.save();

            return res.status(201).send({
                success: true,
                message: `Created ${sensorType} list with sensor ${sensorNumber}`
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getSensorList = async (req, res) => {
    try {
        const { sensorType } = req.params;
        if (!["temperature", "humidity", "relay"].includes(sensorType)) {
            return res.status(400).send({
                success: false,
                message: "Invalid sensor type. Must be temperature, humidity, or relay"
            });
        }

        let sensorList = await SensorList.findOne({ sensortype: sensorType });
        return res.status(201).send({ "success": true, "message": sensorList });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getSensorStates = async (req, res) => {
    try {

        const sensorRef = ref(firebase_db, `/`);
        const snapshot = await get(sensorRef);

        const fullData = snapshot.val();
        const fullhumidityData = fullData['humidity-sensors'];
        const fulltemperatureData = fullData['temperature-sensors'];
        const fullrelayData = fullData['relay-sensors'];

        const humidityArray = Object.keys(fullhumidityData).map((sensorId) => ({
            sensorNumber: sensorId,
            state: fullhumidityData[sensorId].state,
        }));

        const temperatureArray = Object.keys(fulltemperatureData).map((sensorId) => ({
            sensorNumber: sensorId,
            state: fulltemperatureData[sensorId].state,
        }));

        const relayArray = Object.keys(fullrelayData).map((sensorId) => ({
            sensorNumber: sensorId,
            state: fullrelayData[sensorId].state,
        }));
        const resultData = {
            'temperatureStates': temperatureArray,
            'humidityStates': humidityArray,
            'relayStates': relayArray
        }
        // console.log(resultData);

        return res.status(200).send({ "success": true, "message": resultData });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getPlantDiseaseStats = async (req, res) => {
    try {

        const sensorRef = ref(firebase_db, `/plant-disease-prediction_stats`);
        const snapshot = await get(sensorRef);
        const result = snapshot.val();

        return res.status(200).send({ "success": true, "message": result });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
}

export const getInsights = async (req, res) => {
    try {
        const endStamp = Date.now();
        const endDate = new Date(endStamp);

        const startDate = new Date(endStamp);
        startDate.setMonth(startDate.getMonth() - 6);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        const dateFormat = "%Y-%m";

        const aggregate_pipeline_1 = [
            { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    averageTemperature: { $avg: "$temperature" },
                    stdDeviationTemperature: { $stdDevSamp: "$temperature" },
                    medianTemperature: {
                        $percentile: {
                            input: "$temperature",
                            p: [0.5],
                            method: "approximate"
                        }
                    }
                }
            }
        ];

        const aggregate_pipeline_2 = [
            { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    averageSoilMoisture: { $avg: "$humidity" },
                    stdDeviationSoilMoisture: { $stdDevSamp: "$humidity" },
                    medianSoilMoisture: {
                        $percentile: {
                            input: "$humidity",
                            p: [0.5],
                            method: "approximate"
                        }
                    }
                }
            }
        ];

        const resultTemp = await TemperatureData.aggregate(aggregate_pipeline_1);
        const resultSoilMoist = await HumidityData.aggregate(aggregate_pipeline_2);

        const formattedTemp = JSON.stringify(resultTemp, null, 2);
        const formattedMoisture = JSON.stringify(resultSoilMoist, null, 2);

        const prompt = `You are an agricultural AI assistant. Strict rules:
            1. Base responses ONLY on provided data
            2. Never invent data points
            3. Categorize recommendations by risk level

            Provided Data:
            - Temperature (monthly): ${formattedTemp}
            - Soil Moisture (monthly): ${formattedMoisture}

            Analysis Requirements:
            🟢 Safe Range: 10-25°C temp, 30-60% moisture
            🟡 Caution: <10°C or >25°C temp, <30% or >60% moisture
            🔴 Danger: <0°C or >35°C temp, <15% or >80% moisture

            Format response with: 
            1. Current Status (with emoji alerts)
            2. Immediate Recommendations
            3. Risk Assessment Matrix
            4. Data Limitations Disclaimer`;

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            // Remove the responseMimeType to get markdown text instead of JSON
            // responseMimeType: "application/json",
        };
        const genAI = new GeminiClientSingleton();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b", generationConfig });

        const result = await model.generateContent(prompt);

        const text = result.response.text();

        const safetyCheck = (text) => {
					const redFlags = [
						/over *?water/i,
						/drought conditions/i,
						/extreme (heat|cold)/i,
						/immediate danger/i,
					];

					return {
						containsWarnings: redFlags.some((regex) => regex.test(text)),
						requiresHumanReview: redFlags.some((regex) => regex.test(text)),
					};
				};
        
        const validation = safetyCheck(text);

        return res.status(200).send({ "success": true, "message": text, "validation": validation });

    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .send({ success: false, message: "Internal server error" });
    }
};

export const getReport = async (req, res) => {
    try {
        const { month } = req.query;
        const NODE_BASE_URL = process.env.NODE_BACKEND_URL;
        const FORECAST_BASE_API = process.env.SOILPRED_BASE_URL;

        const monthsToSubtract = parseInt(month) || 1;
        const now = new Date();
        const startDateObj = new Date();
        startDateObj.setMonth(now.getMonth() - monthsToSubtract);
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const endDate = formatDate(now);
        const startDate = formatDate(startDateObj);
        const endDateObj = new Date(endDate);
        let dateFormat = "%Y-%m";

        const aggregate_pipeline_temp = [
            {
                $match: {
                    timestamp: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    }
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    totalDocuments: { $sum: 1 },
                    avgTemperature: { $avg: "$temperature" },
                    minTemperature: { $min: "$temperature" },
                    maxTemperature: { $max: "$temperature" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ];
        let result_temperature = await TemperatureData.aggregate(aggregate_pipeline_temp);

        const aggregate_pipeline_humi = [
            {
                $match: {
                    timestamp: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    }
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    totalDocuments: { $sum: 1 },
                    avgHumidity: { $avg: "$humidity" },
                    minHumidity: { $min: "$humidity" },
                    maxHumidity: { $max: "$humidity" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ];
        let result_humidity = await HumidityData.aggregate(aggregate_pipeline_humi);

        const response_getInsights = await InsightFetcher();
        let result_insight = response_getInsights;
        // console.log(result_insight)
        
        const response_plant_stats = await PlantStatsFetcher();
        let result_plantstats = response_plant_stats;
        // console.log(result_plantstats)

        // const response_soil_forecast = await axios.get(`${FORECAST_BASE_API}/forecast`);
        // let result_soil_forecast = response_soil_forecast.data.forecast;

        const result_waterusage = [
            { month: "Jan", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Feb", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Mar", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Apr", value: Math.floor(Math.random() * 101) + 50 },
            { month: "May", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Jun", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Jul", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Aug", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Sep", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Oct", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Nov", value: Math.floor(Math.random() * 101) + 50 },
            { month: "Dec", value: Math.floor(Math.random() * 101) + 50 }
        ];

        let result = {
            report: {
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                temperature: {
                    analytics: result_temperature || []
                },
                humidity: {
                    analytics: result_humidity || []
                }
            },
            insights: result_insight || "No insights available",
            waterUsage: result_waterusage,
            plantHealth: {
                diseaseStats: result_plantstats || {}
            },
            // forecast: {
            //     soil: result_soil_forecast || []
            // },
            meta: {
                generatedAt: new Date().toISOString(),
                reportPeriod: `${monthsToSubtract} month(s)`,
                dataPoints: {
                    temperature: result_temperature?.length || 0,
                    humidity: result_humidity?.length || 0
                }
            }
        }

        return res.status(200).send({ "success": true, "message": result });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ "success": false, "message": "Internal server error" });
    }
};

const PlantStatsFetcher = async() => {
    try {
        
        const sensorRef = ref(firebase_db, `/plant-disease-prediction_stats`);
        const snapshot = await get(sensorRef);
        const result = snapshot.val();
        return result
    } catch (error) {
        console.log(error);
        return "Couldn't generate the Insights Sorry :("
    }
}

const InsightFetcher = async () => {
    try {
        const endStamp = Date.now();
        const endDate = new Date(endStamp);

        const startDate = new Date(endStamp);
        startDate.setMonth(startDate.getMonth() - 6);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        const dateFormat = "%Y-%m";

        const aggregate_pipeline_1 = [
            { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    averageTemperature: { $avg: "$temperature" },
                    stdDeviationTemperature: { $stdDevSamp: "$temperature" },
                    medianTemperature: {
                        $percentile: {
                            input: "$temperature",
                            p: [0.5],
                            method: "approximate"
                        }
                    }
                }
            }
        ];

        const aggregate_pipeline_2 = [
            { $match: { timestamp: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                    averageSoilMoisture: { $avg: "$humidity" },
                    stdDeviationSoilMoisture: { $stdDevSamp: "$humidity" },
                    medianSoilMoisture: {
                        $percentile: {
                            input: "$humidity",
                            p: [0.5],
                            method: "approximate"
                        }
                    }
                }
            }
        ];

        const resultTemp = await TemperatureData.aggregate(aggregate_pipeline_1);
        const resultSoilMoist = await HumidityData.aggregate(aggregate_pipeline_2);

        const formattedTemp = JSON.stringify(resultTemp, null, 2);
        const formattedMoisture = JSON.stringify(resultSoilMoist, null, 2);

        const prompt = `You are an AI assistant that provides farmer-friendly insights on soil moisture (percentage) and temperature (Celsius).  
The data provided are as follows:  
- **Temperature:** ${formattedTemp}°C  
- **Soil Moisture:** ${formattedMoisture}%  

### 📊 **Insights on the Data:**  
Explain what these values mean in **simple language** that a farmer can understand.  

### 💧 **Practical Irrigation Advice:**  
Provide actionable irrigation recommendations based on the given values.  

### ⚠️ **Potential Issues:**  
Detect any possible risks like overwatering, drought conditions, or extreme temperatures.  

### 🌱 **Seasonal Patterns:**  
Identify any trends or patterns in soil moisture and temperature based on typical seasonal variations.  

Format the output in **proper markdown** for easy readability.`;

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            // Remove the responseMimeType to get markdown text instead of JSON
            // responseMimeType: "application/json",s
        };
        const genAI = new GeminiClientSingleton();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b", generationConfig });

        const result = await model.generateContent(prompt);

        const text = result.response.text();
        return text;
    } catch (error) {
        console.log(error);
        return "Couldn't generate the Insights Sorry :("
    }
}