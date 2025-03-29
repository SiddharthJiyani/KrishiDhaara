import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  Cloud,
  Leaf,
  BookOpen,
  BarChart2,
  ArrowLeft,
  Sun,
  Moon,
  Calendar,
  Download,
  Thermometer,
  Droplets,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  BarChart,
  DoughnutChart,
  MultiLineChart,
  ForecastChart,
} from "../components/charts";
import { motion, useInView } from "framer-motion";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { usePDF } from 'react-to-pdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AI_URL = import.meta.env.VITE_AI_URL;

export default function StatsPage() {
  const [theme, setTheme] = useState("light");
  const [timeRange, setTimeRange] = useState("12");
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
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const reportRef = useRef(null);

  // IMPORTANT: Connect the ref to the PDF hook
  const { toPDF } = usePDF({
    targetRef: reportRef,  // This is the critical line that was missing!
    filename: 'kisan-agricultural-report.pdf',
    page: {
      margin: 15,
      format: 'a4',
      orientation: 'portrait',
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1,
    },
    pdf: {
      compress: true,
    },
  });

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
    setMounted(true);
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
      start: '2025-02-28',
      end: '2025-03-28',
    },
    temperature: {
      analytics: [
        {
          _id: '2025-03',
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
          _id: '2025-03',
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
      soil: forecastData.length > 0 ? forecastData : [
        { humidity: 55.28, temperature: 28.5, timestamp: 'Fri, 28 Mar 2025 04:00:00 GMT' },
        { humidity: 58.58, temperature: 27.22, timestamp: 'Fri, 28 Mar 2025 08:00:00 GMT' },
        { humidity: 59.85, temperature: 26.28, timestamp: 'Fri, 28 Mar 2025 12:00:00 GMT' },
        { humidity: 60.32, temperature: 26.29, timestamp: 'Fri, 28 Mar 2025 16:00:00 GMT' },
        { humidity: 60.49, temperature: 26.44, timestamp: 'Fri, 28 Mar 2025 20:00:00 GMT' },
        { humidity: 60.55, temperature: 26.55, timestamp: 'Sat, 29 Mar 2025 00:00:00 GMT' },
      ],
    },
  };

  const plantHealthData = [
    {
      label: 'Healthy',
      value: (reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100,
      color: '#4CAF50',
    },
    {
      label: 'Unhealthy',
      value: (reportData.plantHealth.diseaseStats.unhealthy_count / reportData.plantHealth.diseaseStats.total_count) * 100,
      color: '#FF5252',
    },
  ];

  const tempData = reportData.temperature.analytics[0];
  const humidityData = reportData.humidity.analytics[0];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIndianSeason = (dateString) => {
    const monthNum = new Date(dateString).getMonth();
    if (monthNum >= 2 && monthNum <= 5) return 'Grishma (Summer)';
    if (monthNum >= 6 && monthNum <= 9) return 'Varsha (Monsoon)';
    return 'Shishira (Winter)';
  };

  const currentSeason = getIndianSeason(reportData.dateRange.end);

  const handleGenerateReport = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Generate PDF directly from the hidden report component
      await toPDF();
      setShowSuccess(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was a problem creating your PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const customComponents = {
    h1: ({ node, ...props }) => (
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0' }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 style={{ fontSize: '20px', fontWeight: 'semibold', margin: '12px 0' }} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 style={{ fontSize: '18px', fontWeight: 'medium', margin: '10px 0', color: '#138808' }} {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 style={{ fontSize: '16px', fontWeight: 'medium', margin: '8px 0' }} {...props} />
    ),
    p: ({ node, ...props }) => <p style={{ margin: '8px 0', lineHeight: '1.6' }} {...props} />,
    li: ({ node, ...props }) => <li style={{ marginLeft: '24px', listStyle: 'disc', marginBottom: '8px' }} {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code style={{ backgroundColor: '#f1f1f1', padding: '0 4px', borderRadius: '4px' }}>
            {children}
          </code>
        );
      }
      return (
        <pre style={{ backgroundColor: '#333', color: 'white', padding: '16px', borderRadius: '4px', overflow: 'auto', margin: '8px 0' }}>
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{ borderLeft: '4px solid #ccc', paddingLeft: '16px', fontStyle: 'italic', margin: '8px 0' }}
        {...props}
      />
    ),
  };

  const insightsContent = `
### Temperature & Humidity Analysis

The average temperature of ${tempData.avgTemperature.toFixed(1)}°C is within the range suitable for many traditional Indian crops like rice, wheat, and sugarcane. However, this temperature is at the higher end, which may cause heat stress for some crops during peak day temperatures. The soil moisture averages ${humidityData.avgHumidity.toFixed(1)}%, which is moderate for most Indian agricultural soils, but may need supplementation during dry spells, especially for water-intensive crops like paddy.

### Practical Irrigation Advice for Indian Farmers

Given the temperature and moisture conditions, we recommend the following irrigation strategies:

* Consider drip irrigation for vegetables and fruit crops to conserve water
* For rice cultivation, maintain appropriate standing water levels as per growth stage
* Practice mulching techniques to reduce soil water evaporation
* Water during early morning or late evening to minimize evaporation loss
* Implement water harvesting structures like farm ponds or check dams for water conservation

### Potential Issues to Monitor

* **Heat stress:** The high average temperature may affect flowering and fruiting in sensitive crops like tomatoes and peppers
* **Water management:** In regions prone to water scarcity, consider rainwater harvesting or groundwater recharge methods
* **Disease surveillance:** With only ${Math.round((reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100)}% of plants in healthy condition, implement regular monitoring for common Indian crop diseases such as rice blast, wheat rust, and tomato leaf curl virus
`;

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

        {/* Box with Select & Export */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-[#414142] dark:bg-[#121215]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium dark:text-white">
                Time Range:
              </span>
              <Select defaultValue="12" onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px] cursor-pointer bg-[#0c0c0f] text-white border-1">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent className="bg-[#0c0c0f] text-white">
                  <SelectItem
                    className="hover:bg-[#27272a] cursor-pointer"
                    value="3">
                    Last 3 Months
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-[#27272a] cursor-pointer"
                    value="6">
                    Last 6 Months
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-[#27272a] cursor-pointer"
                    value="12">
                    Last 12 Months
                  </SelectItem>
                  <SelectItem
                    className="hover:bg-[#27272a] cursor-pointer"
                    value="24">
                    Last 24 Months
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-white cursor-pointer"
                onClick={handleGenerateReport}
                disabled={isGeneratingPDF}>
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? "Generating PDF..." : "Generate Report"}
              </Button>
              
              {/* Simple success notification */}
              {showSuccess && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-green-100 text-green-800 rounded-md flex items-center gap-2 shadow-md z-50 whitespace-nowrap">
                  <CheckCircle className="h-4 w-4" />
                  <span>PDF downloaded successfully!</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="water" className="mb-8 cursor-pointer">
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

      {/* Hidden report component that will be used for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', overflow: 'hidden' }}>
        <div ref={reportRef} style={{
            width: '800px',
            padding: '20px',
            backgroundColor: '#fff',
            color: '#333',
            fontFamily: 'Arial, sans-serif',
          }}>
          {/* Header with Report Title */}
          <div style={{
            textAlign: 'center', 
            marginBottom: '30px',
            background: 'linear-gradient(to right, #e7f5e7, #ffffff)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(76, 175, 80, 0.2)',
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#000080',
              marginBottom: '10px',
            }}>
              किसान कृषि स्वास्थ्य रिपोर्ट
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#000080',
              marginBottom: '10px',
            }}>
              Kisan Agricultural Health Report
            </div>
            <div style={{ fontSize: '16px', color: '#555' }}>
              Reporting Period: {formatDate(reportData.dateRange.start)} to {formatDate(reportData.dateRange.end)}
            </div>
            <div style={{ fontSize: '16px', color: '#555', marginTop: '5px' }}>
              Season: {currentSeason}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px',
              color: '#138808',
              fontSize: '20px',
            }}>
              <span style={{ margin: '0 10px' }}>🌾</span>
              <span style={{ margin: '0 10px' }}>🍚</span>
              <span style={{ margin: '0 10px' }}>🌿</span>
              <span style={{ margin: '0 10px' }}>🌶️</span>
            </div>
          </div>

          {/* Key Metrics Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              flex: '1 1 30%',
              minWidth: '200px',
              margin: '10px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#FFF7E0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', color: '#FF9933', fontWeight: 'bold' }}>Average Temperature</div>
              <div style={{ fontSize: '28px', marginTop: '10px', color: '#FF9933' }}>{tempData.avgTemperature.toFixed(1)}°C</div>
              <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
                Range: {tempData.minTemperature.toFixed(1)}°C - {tempData.maxTemperature.toFixed(1)}°C
              </div>
            </div>

            <div style={{
              flex: '1 1 30%',
              minWidth: '200px',
              margin: '10px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#E3F2FD',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', color: '#2196F3', fontWeight: 'bold' }}>Average Humidity</div>
              <div style={{ fontSize: '28px', marginTop: '10px', color: '#2196F3' }}>{humidityData.avgHumidity.toFixed(1)}%</div>
              <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
                Range: {humidityData.minHumidity.toFixed(1)}% - {humidityData.maxHumidity.toFixed(1)}%
              </div>
            </div>

            <div style={{
              flex: '1 1 30%',
              minWidth: '200px',
              margin: '10px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#E8F5E9',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', color: '#138808', fontWeight: 'bold' }}>Plant Health</div>
              <div style={{ fontSize: '28px', marginTop: '10px', color: '#138808' }}>
                {Math.round((reportData.plantHealth.diseaseStats.healthy_count / reportData.plantHealth.diseaseStats.total_count) * 100)}%
              </div>
              <div style={{ fontSize: '14px', marginTop: '5px', color: '#555' }}>
                {reportData.plantHealth.diseaseStats.healthy_count} of {reportData.plantHealth.diseaseStats.total_count} plants healthy
              </div>
            </div>
          </div>

          {/* Temperature and Humidity Tables Section */}
          <div style={{
            marginBottom: '40px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#000080',
              marginBottom: '20px',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '10px',
            }}>
              Temperature & Humidity Data
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
                <h3 style={{ fontSize: '18px', color: '#FF9933', marginBottom: '10px' }}>Temperature Analysis</h3>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  marginBottom: '20px',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FFF7E0' }}>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Metric</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Average Temperature</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.avgTemperature.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Minimum Temperature</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.minTemperature.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Maximum Temperature</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.maxTemperature.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Temperature Range</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(tempData.maxTemperature - tempData.minTemperature).toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Number of Readings</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tempData.totalDocuments}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ flex: '1 1 45%', minWidth: '280px' }}>
                <h3 style={{ fontSize: '18px', color: '#2196F3', marginBottom: '10px' }}>Humidity Analysis</h3>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#E3F2FD' }}>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Metric</th>
                      <th style={{ padding: '10px', border: '1px solid #ddd' }}>Value (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Average Humidity</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.avgHumidity.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Minimum Humidity</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.minHumidity.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Maximum Humidity</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.maxHumidity.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Humidity Range</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(humidityData.maxHumidity - humidityData.minHumidity).toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>Number of Readings</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{humidityData.totalDocuments}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '40px',
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#000080',
              marginBottom: '20px',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '10px',
            }}>
              Agricultural Insights for Indian Conditions
            </h2>

            <div style={{ fontSize: '16px', overflowWrap: 'break-word' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={customComponents}
              >
                {insightsContent}
              </ReactMarkdown>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0',
            paddingTop: '20px',
            fontSize: '14px',
            color: '#777',
          }}>
            <p>Report generated on {new Date().toLocaleDateString('en-IN')}</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: '#138808',
              }}>
                <span style={{ margin: '0 5px' }}>🌾</span>
                <span>जय किसान - Jai Kisan</span>
                <span style={{ margin: '0 5px' }}>🌾</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}