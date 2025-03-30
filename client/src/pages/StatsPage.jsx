import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Cloud, Leaf, BarChart2, ArrowLeft, Download, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, DoughnutChart, ForecastChart, WaterUsageChart } from "../components/charts";
import { motion } from "framer-motion";
import axios from "axios";
import { usePDF } from "react-to-pdf";
import { useNavigate } from "react-router-dom";
import "../i18n";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AI_URL = import.meta.env.VITE_AI_URL;

export default function StatsPage() {
  const { t, i18n } = useTranslation('stats');
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("water");
  const [healthData, setHealthData] = useState([
    {
      label: t("statsPage.plant.chartLabels.healthy"),
      value: Math.ceil(80),
      color: "#10b981",
    },
    {
      label: t("statsPage.plant.chartLabels.unhealthy"),
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
  const [waterUsageData, setWaterUsageData] = useState([]);
  const [isLoadingWaterData, setIsLoadingWaterData] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const reportRef = useRef(null);
  const navigate = useNavigate();

  // Toggle language function
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

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
            label: t("statsPage.plant.chartLabels.healthy"),
            value: Math.ceil(healthyPercent),
            color: "#10b981",
          },
          {
            label: t("statsPage.plant.chartLabels.unhealthy"),
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

  // Fetch water usage data
  const fetchWaterUsageData = async () => {
    setIsLoadingWaterData(true);
    try {
      // Use the date range from state
      const startStamp = dateRange.startDate;
      const endStamp = dateRange.endDate;
      
      console.log(`Fetching water usage data from ${startStamp} to ${endStamp}`);
      
      // Make the API call with query parameters
      const url =  `${BACKEND_URL}/SensorData/relay/getWaterUsage/relay1`;
      console.log("API URL:", url);
      
      const response = await axios.post(url, { 
        params: { startStamp, endStamp },
        withCredentials: true 
      });

      console.log('Response:', response);

      console.log("API Response:", response.data);

      if (response.data.success === true) {
        // Sort the data by timestamp - most recent first
        const sortedData = [...response.data.message].sort((a, b) => {
          const dateA = new Date(a.startTimestamp);
          const dateB = new Date(b.startTimestamp);
          return dateA - dateB; // For ascending order (oldest first)
        });
        
        setWaterUsageData(sortedData);
      } else {
        console.log("Failed to fetch water usage data");
        // Set example data if API fails
        setWaterUsageData([]);
      }
    } catch (error) {
      console.error("Error fetching water usage data:", error);
      // Set example data if API fails
      setWaterUsageData([]);
    } finally {
      setIsLoadingWaterData(false);
    }
  };

  // Update health data when language changes
  useEffect(() => {
    const updatedHealthData = [
      {
        label: t("statsPage.plant.chartLabels.healthy"),
        value: healthData[0].value,
        color: "#10b981",
      },
      {
        label: t("statsPage.plant.chartLabels.unhealthy"),
        value: healthData[1].value,
        color: "#ef4444",
      },
    ];
    setHealthData(updatedHealthData);
  }, [i18n.language, t]);

  // Fetch data when component mounts or when date range changes
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlantHealthHistory();
    fetchForecastData();
  }, []);

  // Fetch water data when date range changes
  useEffect(() => {
    if (activeTab === 'water') {
      fetchWaterUsageData();
    }
  }, [dateRange, activeTab]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Handle date range change
  const handleDateChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  // Calculate total water usage and duration
  const totalWaterUsage = waterUsageData.reduce((sum, item) => sum + item.waterUsageLiters, 0);
  const totalDuration = waterUsageData.reduce((sum, item) => sum + item.durationMinutes, 0);
  const avgEfficiency = totalDuration > 0 ? (totalWaterUsage / totalDuration).toFixed(2) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${
        theme === "dark" ? "dark" : ""
      } min-h-screen bg-white dark:bg-black`}>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-zinc-600 cursor-pointer hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
              <span>{t("statsPage.back")}</span>
            </a>
          </motion.div>
          
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8">
          <h1 className="text-3xl font-bold text-purple-500 dark:text-purple-400">
            {t("statsPage.title")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {t("statsPage.subtitle")}
          </p>
        </motion.div>

        <Tabs
          defaultValue="water"
          className="mb-8 flex flex-col gap-5 md:flex-row justify-between items-center cursor-pointer">
          <TabsList className="bg-zinc-100 text-slate-400 dark:bg-[#27272a] cursor-pointer">
            <TabsTrigger
              value="water"
              onClick={() => setActiveTab("water")}
              className={
                activeTab === "water"
                  ? "data-[state=active]:bg-white dark:bg-zinc-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <BarChart2 className="mr-2 h-4 w-4" />
              {t("statsPage.tabs.water")}
            </TabsTrigger>
            <TabsTrigger
              value="plant"
              onClick={() => setActiveTab("plant")}
              className={
                activeTab === "plant"
                  ? "data-[state=active]:bg-white bg-zinc-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <Leaf className="mr-2 h-4 w-4" />
              {t("statsPage.tabs.plant")}
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              onClick={() => setActiveTab("forecast")}
              className={
                activeTab === "forecast"
                  ? "data-[state=active]:bg-white bg-zinc-100 cursor-pointer"
                  : "cursor-pointer"
              }>
              <Cloud className="mr-2 h-4 w-4" />
              {t("statsPage.tabs.forecast")}
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
                {t("statsPage.buttons.previewReport")}
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
          className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl font-medium dark:text-white">
                {activeTab === "water"
                  ? t("statsPage.water.title")
                  : activeTab === "plant"
                  ? t("statsPage.plant.title")
                  : t("statsPage.forecast.title")}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {activeTab === "water"
                  ? t("statsPage.water.description")
                  : activeTab === "plant"
                  ? t("statsPage.plant.description")
                  : t("statsPage.forecast.description")}
              </p>
            </div>
            
            {/* Date Selection for Water Usage */}
            {activeTab === "water" && (
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
                <div className="flex flex-col">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t("statsPage.water.date.startDate")}</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-zinc-900 bg-zinc-200 border border-r-0 border-zinc-300 rounded-l-md dark:bg-zinc-600 dark:text-zinc-400 dark:border-zinc-600">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateChange(e, 'startDate')}
                      className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t("statsPage.water.date.endDate")}</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-zinc-900 bg-zinc-200 border border-r-0 border-zinc-300 rounded-l-md dark:bg-zinc-600 dark:text-zinc-400 dark:border-zinc-600">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateChange(e, 'endDate')}
                      className="bg-zinc-50 border border-zinc-300 text-zinc-900 text-sm rounded-r-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-auto min-h-80">
            {activeTab === "water" && (
              <div className="flex flex-col space-y-6">
                <div className="h-64 md:h-80">
                  {isLoadingWaterData ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{t("statsPage.water.loading")}</p>
                    </div>
                  ) : waterUsageData.length > 0 ? (
                    <WaterUsageChart data={waterUsageData} isLoading={isLoadingWaterData} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-lg text-zinc-500 dark:text-zinc-400">{t("statsPage.water.noData")}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-blue-50 dark:bg-[#121215] border border-[#414142] p-4 shadow">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.water.metrics.totalUsage")}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalWaterUsage.toFixed(1)} {t("statsPage.water.metrics.liters")}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-green-50 dark:bg-[#121215] border border-[#414142]  p-4 shadow">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.water.metrics.totalDuration")}
                    </h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalDuration.toFixed(1)} {t("statsPage.water.metrics.minutes")}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="rounded-lg bg-amber-50 dark:bg-[#121215] border border-[#414142] p-4 shadow">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.water.metrics.avgEfficiency")}
                    </h3>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {avgEfficiency} {t("statsPage.water.metrics.litersPerMin")}
                    </p>
                  </motion.div>
                </div>
              </div>
            )}
            
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
                    className="rounded-lg bg-zinc-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.plant.metrics.healthy")}
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
                    className="rounded-lg bg-zinc-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.plant.metrics.unhealthy")}
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
                    className="rounded-lg bg-zinc-50 p-4 dark:bg-[#121215] dark:border dark:border-[#414142]">
                    <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.plant.metrics.total")}
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
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {t("statsPage.forecast.loading")}
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