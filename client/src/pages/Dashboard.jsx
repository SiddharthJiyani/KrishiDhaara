import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Leaf,
  BarChart2,
  Sun,
  Moon,
  Cloud,
  BookOpen,
  ArrowLeft,
  Droplet,
  Thermometer,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { AreaChart, MultiLineChart } from "../components/charts";
import { Clock } from "lucide-react";
import Header from "../components/Header";
import { data } from "react-router-dom";
import { motion } from "framer-motion";
import { styled } from "styled-components";
import { formatInsights } from "../lib/Insights";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ref, onValue, get, set } from "firebase/database";
import { database } from "../lib/firebase";
import FarmMap from "../components/FarmMapLeaflet";
// import rehypeRaw from "rehype-raw";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

var acTab = "";
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    start: "2025-01-01",
    end: "2027-07-30",
  });
  const [analysisType, setAnalysisType] = useState("daily");
  const [selectedSensorType, setSelectedSensorType] = useState("humidity");
  const [selectedSensor, setSelectedSensor] = useState("");
  const [sensorData, setSensorData] = useState({});
  const [analyticsData, setAnalyticsData] = useState([]);
  const [sensorList, setSensorList] = useState([]);
  const [allSensorList, setAllSensorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxMinData, setMaxMinData] = useState({
    minmaxHumidity: [],
    // minHumidity: [],
    minmaxTemperature: [],
    // minTemperature: [],
  });

  const customComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold my-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold my-3" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-medium my-2" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-medium my-2" {...props} />
    ),
    p: ({ node, ...props }) => <p className="my-2" {...props} />,
    li: ({ node, ...props }) => <li className="ml-6 list-disc" {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-900 text-white p-4 rounded overflow-auto my-2">
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-2"
        {...props}
      />
    ),
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  acTab = activeTab;

  useEffect(() => {
    fetchSensorData();
  }, []);

  useEffect(() => {
    fetchSensorList(selectedSensorType);
  }, [selectedSensorType]);

  useEffect(() => {
    if (selectedSensor && dateRange?.start && dateRange?.end) {
      fetchAnalyticsData();
    }
  }, [selectedSensor, dateRange, analysisType]);

  const fetchSensorData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/SensorData/getLatest`, {
        withCredentials: true,
      });
      const data = response.data.message;
      setSensorData(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  const fetchSensorList = async (sensorType) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/SensorData/getSensor/${sensorType}`,
        { withCredentials: true }
      );
      const data = response.data.message.sensors;
      setSensorList(data);
      if (data.length > 0) {
        setSelectedSensor(data[0]); // Set the first sensor as default
      }
    } catch (error) {
      console.error("Error fetching sensor list:", error);
    }
  };

  const fetchAllSensorList = async () => {
    try {
      const response1 = await axios.get(
        `${BACKEND_URL}/SensorData/getSensor/humidity`,
        { withCredentials: true }
      );
      const response2 = await axios.get(
        `${BACKEND_URL}/SensorData/getSensor/temperature`,
        { withCredentials: true }
      );
      const data1 = response1.data.message.sensors;
      const data2 = response2.data.message.sensors;
      // Combine both sensor lists
      const sensorTypes = [...new Set([...data1, ...data2])];
      setAllSensorList(sensorTypes);
    } catch (error) {
      console.error("Error fetching sensor list:", error);
    }
  };

  useEffect(() => {
    fetchAllSensorList();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        // `http://localhost:3000/SensorData/${selectedSensorType}/getAnalytics/${selectedSensor}`,
        `${BACKEND_URL}/SensorData/${selectedSensorType}/getAnalytics/${selectedSensor}`,
        {
          params: {
            startStamp: dateRange.start,
            endStamp: dateRange.end,
            interval:
              analysisType === "daily"
                ? "day"
                : analysisType === "monthly"
                ? "month"
                : "year",
          },
          withCredentials: true,
        }
      );
      const data = response.data.message;
      setAnalyticsData(data);
      setMaxMinData({
        minmaxHumidity: getMaxHumidity(data),
        // minHumidity: getMinHumidity(data),
        minmaxTemperature: getMaxTemperature(data),
        // minTemperature: getMinTemperature(data),
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalysisTypeChange = (e) => {
    setAnalysisType(e.target.value);
  };

  const handleSensorTypeChange = (e) => {
    setSelectedSensorType(e.target.value);
  };

  const handleSensorChange = (e) => {
    setSelectedSensor(e.target.value);
  };

  const processedData = processData(analyticsData, analysisType);

  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [validation, setValidation] = useState({
    requiresHumanReview: false,
    containsWarnings: false
  });

  const handleGetInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      setValidation({ requiresHumanReview: false, containsWarnings: false });

      const response = await axios.get(
        // "http://localhost:3000/SensorData/getInsights",
        `${BACKEND_URL}/SensorData/getInsights`,
        { withCredentials: true }
      );

      if (response.data.success === true) {
        // The response should now be direct markdown text
        setInsights(
          response.data.message || "No insights available at the moment."
        );
        if (response.data.validation) {
          setValidation({
            requiresHumanReview: response.data.validation.requiresHumanReview,
            containsWarnings: response.data.validation.containsWarnings
          });
        }
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsError(
        "An error occurred while fetching insights. Please try again later."
      );
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8">
          <h1 className="text-3xl font-bold text-green-500 dark:text-green-600">
            Krishi Dhaara Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Monitor and control your smart irrigation system with real-time
            insights
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs defaultValue={activeTab} className="mb-8">
          <TabsList className="bg-zinc-100 text-slate-400 dark:bg-[#27272a]">
            <TabsTrigger
              className="cursor-pointer hover:bg-zinc-600"
              value="overview"
              onClick={() => setActiveTab("overview")}>
              Overview
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer hover:bg-zinc-600"
              value="sensors"
              onClick={() => setActiveTab("sensors")}>
              Sensors
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer hover:bg-zinc-600"
              value="automation"
              onClick={() => setActiveTab("automation")}>
              Automation
            </TabsTrigger>
            <TabsTrigger
              className="cursor-pointer hover:bg-zinc-600"
              value="map"
              onClick={() => setActiveTab("map")}>
              View Field Map
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === "overview" && (
          <div>
            <OverviewTab
              dateRange={dateRange}
              analysisType={analysisType}
              selectedSensorType={selectedSensorType}
              selectedSensor={selectedSensor}
              handleDateChange={handleDateChange}
              handleAnalysisTypeChange={handleAnalysisTypeChange}
              handleSensorTypeChange={handleSensorTypeChange}
              handleSensorChange={handleSensorChange}
              sensorData={sensorData}
              analyticsData={analyticsData}
              sensorList={sensorList}
              loading={loading}
              maxMinData={maxMinData}
            />

            {/* Replace the current button with this improved version and add insights display */}
            <div className="mt-8">
              <button
                onClick={handleGetInsights}
                disabled={insightsLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {insightsLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting insights...
                  </>
                ) : (
                  <>
                    Get Insights
                    <BarChart2 className="h-4 w-4" />
                  </>
                )}
              </button>

              {validation.containsWarnings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 border border-amber-500 bg-amber-500/20 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-amber-500" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-medium text-amber-500">
                      Expert Review Recommended
                    </h3>
                  </div>
                  
                  {validation.requiresHumanReview && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      These insights contain potential risks that should be verified by an agricultural expert.
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => console.log('Contact expert clicked')}
                      className="px-3 py-1 text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 rounded-md transition-colors"
                    >
                      Contact Expert
                    </button>
                    <button
                      onClick={() => setValidation({ ...validation, requiresHumanReview: false })}
                      className="px-3 py-1 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Display insights when available */}
              {insights && !insightsLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-4 p-4 border ${
                      validation.requiresHumanReview 
                        ? 'border-amber-500 dark:border-amber-400/50' 
                        : 'border-zinc-200 dark:border-[#414142]'
                    } bg-white dark:bg-[#121215] rounded-md`}>
                  <h3 className="text-lg font-semibold mb-3 text-green-500">
                    AI Insights
                  </h3>
                  <div className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed markdown-content">
                    <ReactMarkdown
                      // rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                      components={customComponents}>
                      {insights}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {/* Display error if any */}
              {insightsError && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm">
                  {insightsError}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "sensors" && <SensorsTab sensorData={allSensorList} />}
        {activeTab === "automation" && <AutomationTab />}
        {activeTab === "map" && <FarmMap/>}
      </main>
    </motion.div>
  );
}

// Overview Tab Content
function OverviewTab({
  dateRange,
  analysisType,
  selectedSensorType,
  selectedSensor,
  handleDateChange,
  handleAnalysisTypeChange,
  handleSensorTypeChange,
  handleSensorChange,
  sensorData,
  analyticsData,
  sensorList,
  loading,
  maxMinData,
}) {
  const processedData = processData(analyticsData, analysisType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Soil Moisture"
          iconDiv={<Droplet className="h-5 w-5 text-blue-400" />}
          value={sensorData.resultHumi?.humidity || "Loading..."}
          optimal="40-60%"
          progress="85"
        />
        <StatCard
          title="Temperature"
          iconDiv={<Thermometer className="h-5 w-5 text-yellow-500" />}
          value={sensorData.resultTemp?.temperature || "Loading..."}
          optimal="18-26°C"
          progress="45.6"
        />
      </div>

      {/* Date Range, Analysis Type, Sensor Type, and Sensor Selection */}
      {acTab === "overview" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-5 bg-white dark:border-1 dark:border-[#414142] dark:bg-[#121215] rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium mb-4 text-zinc-800 dark:text-zinc-200">
            Data Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Date Range
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="flex-1 border border-zinc-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
                <div className="flex items-center justify-center text-zinc-400">
                  to
                </div>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="flex-1 border border-zinc-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
              </div>
            </div>

            {/* Analysis Type Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Analysis Type
              </label>
              <div className="flex gap-3">
                {["daily", "monthly", "yearly"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      handleAnalysisTypeChange({ target: { value: type } })
                    }
                    className={`px-4 py-2 text-sm rounded-md flex-1 transition-colors cursor-pointer ${
                      analysisType === type
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                    }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Sensor Type Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Sensor Type
              </label>
              <select
                value={selectedSensorType}
                onChange={handleSensorTypeChange}
                className="w-full cursor-pointer border border-zinc-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white">
                <option value="humidity">Soil Moisture</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>

            {/* Sensor Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Sensor
              </label>
              <select
                value={selectedSensor}
                onChange={handleSensorChange}
                className="w-full border cursor-pointer border-zinc-300 rounded-md p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white">
                {sensorList.map((sensor) => (
                  <option key={sensor} value={sensor} className="">
                    {sensor
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-medium dark:text-white">
            {selectedSensorType === "humidity"
              ? "Soil Moisture Trends"
              : "Temperature Trends"}
          </h3>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          24-hour monitoring data
        </div>
        <div className="mt-4 h-80">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <AreaChart
              data={processedData}
              dataLabel={
                selectedSensorType === "humidity"
                  ? "Soil Moisture"
                  : "Temperature"
              }
              bodyColor={
                selectedSensorType === "humidity" ? "#10b981" : "#f59e0b"
              }
              backgroundColor={
                selectedSensorType === "humidity"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(255, 221, 51, 0.2)"
              }
            />
          )}
        </div>
      </motion.div>

      {/* Max/Min Humidity Chart */}
      {selectedSensorType === "humidity" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium dark:text-white">
              Max/Min Moisture Trends
            </h3>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Date-wise maximum and minimum soil moisture data
          </div>
          <div className="mt-4 h-80">
            <MultiLineChart data={maxMinData.minmaxHumidity} />
          </div>
        </motion.div>
      )}

      {/* Max/Min Temperature Chart */}
      {selectedSensorType === "temperature" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium dark:text-white">
              Max/Min Temperature Trends
            </h3>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Date-wise maximum and minimum temperature data
          </div>
          <div className="mt-4 h-80">
            <MultiLineChart data={maxMinData.minmaxTemperature} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Function to process data based on analysis type
const processData = (data, analysisType) => {
  switch (analysisType) {
    case "monthly":
      return aggregateDataMonthly(data);
    case "yearly":
      return aggregateDataYearly(data);
    default:
      return aggregateDataDaily(data);
  }
};

// Function to aggregate data monthly
const aggregateDataMonthly = (data) => {
  const monthlyData = {};
  data.forEach((item) => {
    const date = new Date(item._id);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { time: monthYear, value: 0, count: 0 };
    }
    monthlyData[monthYear].value += item.avgHumidity || item.avgTemperature;
    monthlyData[monthYear].count += 1;
  });
  return Object.values(monthlyData).map((item) => ({
    time: item.time,
    value: item.value / item.count,
  }));
};

// Function to aggregate data yearly
const aggregateDataYearly = (data) => {
  const yearlyData = {};
  data.forEach((item) => {
    const date = new Date(item._id);
    const year = date.getFullYear();
    if (!yearlyData[year]) {
      yearlyData[year] = { time: year, value: 0, count: 0 };
    }
    yearlyData[year].value += item.avgHumidity || item.avgTemperature;
    yearlyData[year].count += 1;
  });
  return Object.values(yearlyData).map((item) => ({
    time: item.time,
    value: item.value / item.count,
  }));
};

const aggregateDataDaily = (data) => {
  const dailyData = {};
  data.forEach((item) => {
    const date = new Date(item._id);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const monthYearDate = `${year}-${month + 1}-${day}`;
    if (!dailyData[monthYearDate]) {
      dailyData[monthYearDate] = { time: monthYearDate, value: 0, count: 0 };
    }
    dailyData[monthYearDate].value += item.avgHumidity || item.avgTemperature;
    dailyData[monthYearDate].count += 1;
  });

  return Object.values(dailyData).map((item) => ({
    time: item.time,
    value: item.value / item.count,
  }));
};

const getMaxHumidity = (data) => {
  const minmaxHumidity = {}; // {time: '2025-01-01', maxHumidity: 12, minHumidity:10 }
  data.forEach((item) => {
    const date = new Date(item._id);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const monthYearDate = `${year}-${month + 1}-${day}`;
    if (!minmaxHumidity[monthYearDate]) {
      minmaxHumidity[monthYearDate] = {
        time: monthYearDate,
        maxHumidity: 0,
        minHumidity: Infinity,
      };
    }
    minmaxHumidity[monthYearDate].maxHumidity = Math.max(
      minmaxHumidity[monthYearDate].maxHumidity,
      item.maxHumidity
    );
    minmaxHumidity[monthYearDate].minHumidity = Math.min(
      minmaxHumidity[monthYearDate].minHumidity,
      item.minHumidity
    );
  });

  return Object.values(minmaxHumidity).map((item) => ({
    time: item.time,
    max: item.maxHumidity,
    min: item.minHumidity,
  }));
};

const getMaxTemperature = (data) => {
  const minMaxTemperature = {}; // {time: '2025-01-01', maxTemperature: 12, minTemperature:10 }
  data.forEach((item) => {
    const date = new Date(item._id);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const monthYearDate = `${year}-${month + 1}-${day}`;
    if (!minMaxTemperature[monthYearDate]) {
      minMaxTemperature[monthYearDate] = {
        time: monthYearDate,
        maxTemperature: 0,
        minTemperature: Infinity,
      };
    }
    minMaxTemperature[monthYearDate].maxTemperature = Math.max(
      minMaxTemperature[monthYearDate].maxTemperature,
      item.maxTemperature
    );
    minMaxTemperature[monthYearDate].minTemperature = Math.min(
      minMaxTemperature[monthYearDate].minTemperature,
      item.minTemperature
    );
  });

  return Object.values(minMaxTemperature).map((item) => ({
    time: item.time,
    max: item.maxTemperature,
    min: item.minTemperature,
  }));
};

// Sensors Tab Content
function SensorsTab() {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const dbRef = ref(database, "/");

    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const processedSensorData = [];
          if (data) {
            // console.log(data)
            Object.entries(data).forEach(([category, sensors]) => {
              if (
                category !== "plant-disease-prediction_stats" &&
                category !== "relay-sensors-suggestion" &&
                sensors &&
                typeof sensors === "object"
              ) {
                Object.entries(sensors).forEach(([sensor, sensorData]) => {
                  processedSensorData.push({
                    sensorNumber: sensor,
                    state: sensorData.state,
                  });
                  // console.log("Sensor:", sensor, "Data:", sensorData);
                });
              }
            });
          }
          // console.log(processedSensorData);
          setSensorData(processedSensorData);
        } else {
          console.log("No data available from Firebase");
        }
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      });

    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const processedSensorData = [];
        if (data) {
          Object.entries(data).forEach(([category, sensors]) => {
            if (
              category !== "plant-disease-prediction_stats" &&
              category !== "relay-sensors-suggestion" &&
              sensors &&
              typeof sensors === "object"
            ) {
              Object.entries(sensors).forEach(([sensor, sensorData]) => {
                processedSensorData.push({
                  sensorNumber: sensor,
                  state: sensorData.state,
                });
                // console.log("Sensor:", sensor, "Data:", sensorData);
              });
            }
          });
        }
        // console.log(processedSensorData);
        setSensorData(processedSensorData);
      } else {
        console.log("No data available from Firebase");
      }
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-lg border border-zinc-200 dark:border-[#414142] dark:bg-[#121215]">
      <h3 className="text-xl font-bold text-green-500 dark:text-green-400">
        Sensor Data
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        Status of all connected IoT sensors.
      </p>
      <div className="flex flex-col gap-4">
        {sensorData?.map((sensor) => (
          <SensorCard
            key={sensor.sensorNumber}
            sensorName={sensor.sensorNumber}
            status={sensor.state}
            lastReading="5 minutes"
            batteryPercentage={80}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Automation Tab Content
function AutomationTab() {
  const [relays, setRelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Individual loading states for each relay
  const [loadingRelays, setLoadingRelays] = useState({});

  const fetchRelayData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        // "http://localhost:3000/SensorData/relay/getState",.
        `${BACKEND_URL}/SensorData/relay/getState`,
        { withCredentials: true }
      );

      if (response.data.success === true) {
        const allData = response.data.message.states;
        setRelays(allData);
      }
    } catch (error) {
      console.error("Error fetching relay data:", error);
      setError("Failed to load relay data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchRelayData();

    const dbRef = ref(database, "/");

    get(dbRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const processedRelayData = [];

          if (data) {
            Object.entries(data).forEach(([category, devices]) => {
              // Look for relay data in each category
              if (
                category !== "relay-sensors-suggestion" &&
                devices &&
                typeof devices === "object"
              ) {
                Object.entries(devices).forEach(([device, deviceData]) => {
                  // Check if this is a relay device (you might need to adjust this condition)
                  if (
                    device.includes("relay") &&
                    deviceData &&
                    deviceData.state
                  ) {
                    processedRelayData.push({
                      sensorNumber: device,
                      state: deviceData.state,
                    });
                  }
                });
              }
            });
          }
          console.log("Relay Data:", processedRelayData);
          setRelays(processedRelayData);
        } else {
          console.log("No relay data available from Firebase");
        }
      })
      .catch((error) => {
        console.error("Error fetching initial relay data:", error);
        setError("Failed to load relay data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });

    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const processedRelayData = [];

        if (data) {
          Object.entries(data).forEach(([category, devices]) => {
            if (
              category !== "relay-sensors-suggestion" &&
              devices &&
              typeof devices === "object"
            ) {
              Object.entries(devices).forEach(([device, deviceData]) => {
                if (
                  device.includes("relay") &&
                  deviceData &&
                  deviceData.state
                ) {
                  processedRelayData.push({
                    sensorNumber: device,
                    state: deviceData.state,
                  });
                }
              });
            }
          });
        }

        setRelays(processedRelayData);
      }
    });
  }, []);

  const handleToggle = async (relayNumber, currentState) => {
    try {
      // Set loading state for this specific relay
      setLoadingRelays((prev) => ({ ...prev, [relayNumber]: true }));

      // Determine the path to the relay in Firebase
      // This might require searching through the data first
      const newState = currentState === "on" ? "off" : "on";
      let relayPath = null;

      // Get current data to find the correct path
      const snapshot = await get(ref(database, "/"));
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Search for the relay in the data
        Object.entries(data).some(([category, devices]) => {
          if (devices && typeof devices === "object" && devices[relayNumber]) {
            relayPath = `/${category}/${relayNumber}/state`;
            return true;
          }
          return false;
        });
      }

      if (!relayPath) {
        throw new Error(`Could not find path for relay: ${relayNumber}`);
      }

      // Update the state in Firebase
      await set(ref(database, relayPath), newState);

      // Update is handled automatically by the onValue listener
      // but we can update the local state directly for better UX
      setRelays((prevRelays) =>
        prevRelays.map((relay) =>
          relay.sensorNumber === relayNumber
            ? { ...relay, state: newState }
            : relay
        )
      );
    } catch (error) {
      console.error("Error toggling relay:", error);
      setError(`Failed to update relay state: ${error.message}`);
    } finally {
      // Clear loading state for this relay
      setLoadingRelays((prev) => ({ ...prev, [relayNumber]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-xl font-bold text-green-500 dark:text-green-400">
        Manual Override
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        Configure irrigation and sensors.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : relays.length === 0 ? (
        <div className="text-center p-8 text-zinc-500 dark:text-zinc-400">
          No relay devices found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {relays.map((relay) => (
            <div
              key={relay.sensorNumber}
              className="flex justify-between items-center p-4 rounded-lg bg-[#202025]">
              <div className="flex flex-col">
                <h4 className="font-medium text-white">
                  {relay.sensorNumber
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </h4>
              </div>

              <div className="flex items-center gap-3">
                {/* Status indicator with loading animation */}
                {loadingRelays[relay.sensorNumber] ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
                    <span className="text-xs text-gray-300">Updating...</span>
                  </div>
                ) : (
                  <span
                    className={`text-xs ${
                      relay.state === "on" ? "text-green-400" : "text-red-400"
                    }`}>
                    {relay.state === "on" ? "ON" : "OFF"}
                  </span>
                )}

                {/* Toggle switch */}
                <StyledSwitch checked={relay.state === "on"}>
                  <input
                    type="checkbox"
                    checked={relay.state === "on"}
                    onChange={() =>
                      handleToggle(relay.sensorNumber, relay.state)
                    }
                    disabled={loadingRelays[relay.sensorNumber]}
                  />
                  <span className="slider"></span>
                </StyledSwitch>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, iconDiv, value, optimal, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
      <div className="mb-4 flex items-center gap-2">
        <div className="text-green-500">{iconDiv}</div>
        <h3 className="text-lg font-medium dark:text-white">{title}</h3>
      </div>
      <div className="mb-2 text-4xl font-bold dark:text-white">
        {title==="Soil Moisture" ? value + "%" : value + "°C"}
      </div>
      <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
        Optimal: {optimal}
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-2 rounded-full bg-white"
          style={{ width: `${progress}%` }}></div>
      </div>
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Optimal level
      </div>
    </motion.div>
  );
}

function SensorCard({ sensorName, status, lastReading, batteryPercentage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full items-center justify-between p-3 px-6 rounded-lg bg-[#202025]">
      <div>
        <div className="font-medium text-white">{sensorName}</div>
        <div className="text-sm text-muted-foreground text-zinc-400">
          Last reading: {lastReading} ago
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-white">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              status === "on" ? "bg-green-500" : "bg-red-500"
            }`}></span>
          {status === "on" ? "ON" : "OFF"}
        </div>
      </div>
    </motion.div>
  );
}

const StyledSwitch = styled.label`
  /* The switch - the box around the slider */
  font-size: 13px;
  position: relative;
  display: inline-block;
  width: 2.5em;
  height: 1.4em;

  /* Hide default HTML checkbox */
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: ${(props) => (props.checked ? "#0974f1" : "#444")};
    border-radius: 50px;
    transition: all 0.3s ease-in-out;
  }

  .slider:before {
    position: absolute;
    content: "";
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.4em;
    width: 1.4em;
    inset: 0;
    background-color: white;
    border-radius: 50px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease-in-out;
  }

  input:checked + .slider {
    background: #10b981;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #10b981;
  }

  input:disabled + .slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input:checked + .slider:before {
    transform: translateX(1.1em);
  }
`;
