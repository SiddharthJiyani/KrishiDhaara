import React, { useState, useEffect, useRef } from "react";
import { Cloud, Leaf, BarChart2, ArrowLeft, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, DoughnutChart, ForecastChart } from "../components/charts";
import { motion } from "framer-motion";
import axios from "axios";
import { usePDF } from "react-to-pdf";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AI_URL = import.meta.env.VITE_AI_URL;

export default function StatsPage() {
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("water");
  const [healthData, setHealthData] = useState([
    {
      label: "Excellent",
      value: Math.ceil(80),
      color: "#10b981",
    },
    {
      label: "Poor",
      value: Math.floor(20),
      color: "#ef4444",
    },
  ]);
  const [count, setCount] = useState({
    healthy: 0,
    unhealthy: 0,
    total: 0,
  });
  const [forecastData, setForecastData] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const reportRef = useRef(null);
  const navigate = useNavigate();

  const fetchForecastData = async () => {
    try {
      const response = await axios.get(`${AI_URL}/forecast`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const data = response.data;
        setForecastData(data.forecast);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPlantHealthHistory = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/PlantPrediction/getDiseaseStats`,
        { withCredentials: true }
      );

      if (response.data.success === true) {
        const result = response.data.message;
        console.log(result);
        const total = result.total_count || 1;
        const healthyPercent = Math.round((result.healthy_count / total) * 100);
        const unhealthyPercent = Math.round(
          (result.unhealthy_count / total) * 100
        );
        const newHealthData = [
          {
            label: "Healthy",
            value: Math.ceil(healthyPercent),
            color: "#10b981",
          },
          {
            label: "Unhealthy",
            value: Math.floor(unhealthyPercent),
            color: "#ef4444",
          },
        ];
        setHealthData(newHealthData);
        setCount({
          healthy: result["healthy_count"],
          unhealthy: result["unhealthy_count"],
          total,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlantHealthHistory();
    fetchForecastData();
  }, []);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const monthlyData = [
    { month: "Jan", value: 120 },
    { month: "Feb", value: 125 },
    { month: "Mar", value: 110 },
    { month: "Apr", value: 150 },
    { month: "May", value: 180 },
    { month: "Jun", value: 210 },
    { month: "Jul", value: 235 },
    { month: "Aug", value: 220 },
    { month: "Sep", value: 170 },
    { month: "Oct", value: 140 },
    { month: "Nov", value: 125 },
    { month: "Dec", value: 120 },
  ];

  const sensorData = [
    { day: "Mon", soilMoisture: 85, temperature: 65, humidity: 72 },
    { day: "Tue", soilMoisture: 83, temperature: 68, humidity: 74 },
    { day: "Wed", soilMoisture: 78, temperature: 70, humidity: 76 },
    { day: "Thu", soilMoisture: 80, temperature: 72, humidity: 73 },
    { day: "Fri", soilMoisture: 82, temperature: 69, humidity: 71 },
    { day: "Sat", soilMoisture: 88, temperature: 65, humidity: 73 },
    { day: "Sun", soilMoisture: 84, temperature: 67, humidity: 74 },
  ];

  // Report data for PDF generation
  const reportData = {
    dateRange: {
      start: "2025-02-28",
      end: "2025-03-28",
    },
    temperature: {
      analytics: [
        {
          _id: "2025-03",
          totalDocuments: 47,
          avgTemperature: 32.6,
          minTemperature: 19.89,
          maxTemperature: 100,
        },
      ],
    },
    humidity: {
      analytics: [
        {
          _id: "2025-03",
          totalDocuments: 46,
          avgHumidity: 40.5,
          minHumidity: 19.957,
          maxHumidity: 96,
        },
      ],
    },
    waterUsage: monthlyData, // Using the same data from your stats page
    plantHealth: {
      diseaseStats: {
        healthy_count: count.healthy || 13,
        total_count: count.total || 42,
        unhealthy_count: count.unhealthy || 29,
      },
    },
    forecast: {
      soil:
        forecastData.length > 0
          ? forecastData
          : [
              {
                humidity: 55.28,
                temperature: 28.5,
                timestamp: "Fri, 28 Mar 2025 04:00:00 GMT",
              },
              {
                humidity: 58.58,
                temperature: 27.22,
                timestamp: "Fri, 28 Mar 2025 08:00:00 GMT",
              },
              {
                humidity: 59.85,
                temperature: 26.28,
                timestamp: "Fri, 28 Mar 2025 12:00:00 GMT",
              },
              {
                humidity: 60.32,
                temperature: 26.29,
                timestamp: "Fri, 28 Mar 2025 16:00:00 GMT",
              },
              {
                humidity: 60.49,
                temperature: 26.44,
                timestamp: "Fri, 28 Mar 2025 20:00:00 GMT",
              },
              {
                humidity: 60.55,
                temperature: 26.55,
                timestamp: "Sat, 29 Mar 2025 00:00:00 GMT",
              },
            ],
    },
  };

  const tempData = reportData.temperature.analytics[0];
  const humidityData = reportData.humidity.analytics[0];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIndianSeason = (dateString) => {
    const monthNum = new Date(dateString).getMonth();
    if (monthNum >= 2 && monthNum <= 5) return "Grishma (Summer)";
    if (monthNum >= 6 && monthNum <= 9) return "Varsha (Monsoon)";
    return "Shishira (Winter)";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${
        theme === "dark" ? "dark" : ""
      } min-h-screen bg-white dark:bg-black`}>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8">
          <h1 className="text-3xl font-bold text-purple-500 dark:text-purple-400">
            Statistics & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights and trends from your smart irrigation system
          </p>
        </motion.div>

        <Tabs
          defaultValue="water"
          className="mb-8 flex flex-col gap-5 md:flex-row justify-between items-center cursor-pointer">
          <TabsList className="bg-gray-100 text-slate-400 dark:bg-[#27272a] cursor-pointer">
            <TabsTrigger
              value="water"
              onClick={() => setActiveTab("water")}
              className={
                activeTab === "water"
                  ? "data-[state=active]:bg-white dark:bg-gray-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <BarChart2 className="mr-2 h-4 w-4" />
              Water Usage
            </TabsTrigger>
            <TabsTrigger
              value="plant"
              onClick={() => setActiveTab("plant")}
              className={
                activeTab === "plant"
                  ? "data-[state=active]:bg-white bg-gray-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <Leaf className="mr-2 h-4 w-4" />
              Plant Health
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              onClick={() => setActiveTab("forecast")}
              className={
                activeTab === "forecast"
                  ? "data-[state=active]:bg-white bg-gray-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <Cloud className="mr-2 h-4 w-4" />
              Soil Condition Forecast
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-col justify-end gap-4 md:flex-row md:items-center">
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-white cursor-pointer"
                onClick={() => navigate("/report")}
                >
                <Download className="h-4 w-4" />
                Preview Report
              </Button>
            </div>
          </div>
        </Tabs>

        {/* Main Analysis Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
          <div className="mb-4">
            <h2 className="text-xl font-medium dark:text-white">
              {activeTab === "water"
                ? "Water Usage Analysis"
                : activeTab === "plant"
                ? "Plant Health Analysis"
                : "Soil Condition Forecast Analysis"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "water"
                ? "Monthly water consumption compared to average usage"
                : activeTab === "plant"
                ? "Distribution of plant health metrics based on predictions being done by the farmer for his field"
                : "Temperature and moisture predictions for the next 24 hours coming from our trained AI model"}
            </p>
          </div>

          <div className="h-auto min-h-80">
            {activeTab === "water" && <BarChart data={monthlyData} />}
            {activeTab === "plant" && (
              <div className="flex flex-col lg:flex-row w-full items-center">
                <div className="w-full lg:w-1/2 flex justify-center mb-6 lg:mb-0">
                  <DoughnutChart data={healthData} />
                </div>

                <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-gray-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Healthy Predictions
                    </h3>
                    <p className="text-2xl font-bold  text-[#00b579]">
                      {count?.healthy}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-gray-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Unhealthy Predictions
                    </h3>
                    <p className="text-2xl font-bold  text-[#ef4444]">
                      {count.unhealthy}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-gray-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Predictions
                    </h3>
                    <p className="text-2xl font-bold text-white">
                      {count.total}
                    </p>
                  </motion.div>
                </div>
              </div>
            )}
            {activeTab === "forecast" && (
              <div>
                {forecastData?.length > 0 ? (
                  <>
                    <div className="h-80 mb-6">
                      <ForecastChart data={forecastData} />
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading forecast data...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
