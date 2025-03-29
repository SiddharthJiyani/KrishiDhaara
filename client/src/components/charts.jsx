import React, { useRef, useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const matchDark = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(matchDark.matches);

    const handleChange = (e) => setIsDark(e.matches);
    matchDark.addEventListener("change", handleChange);
    return () => matchDark.removeEventListener("change", handleChange);
  }, []);

  return isDark;
};

// Loading Spinner Component
const LoadingSpinner = () => {
  const isDark = useDarkMode();
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className={`mt-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Loading chart data...</p>
    </div>
  );
};

const LineChart = ({ data, isLoading = false }) => {
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: "Temperature",
        data: data.map((item) => item.value),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: isDark ? "#111827" : "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: { color: isDark ? "#9ca3af" : "#6b7280" },
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: { color: isDark ? "#9ca3af" : "#6b7280" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "#374151" : "#ffffff",
        titleColor: isDark ? "#ffffff" : "#111827",
        bodyColor: isDark ? "#d1d5db" : "#4b5563",
        borderColor: isDark ? "#4b5563" : "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

const BarChart = ({ data, isLoading = false }) => {
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  const chartData = {
    labels: data.map((item) => item.month || item.day),
    datasets: [
      {
        label: "Water Usage (Liters)",
        data: data.map((item) => item.value),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{ responsive: true, maintainAspectRatio: false }}
    />
  );
};

const AreaChart = ({ data, dataLabel, bodyColor, backgroundColor, isLoading = false }) => {
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  const chartData = {
    labels: data.map((item) => item.time),
    datasets: [
      {
        label: `${dataLabel}`,
        data: data.map((item) => item.value),
        borderColor: `${bodyColor}`,
        backgroundColor: `${backgroundColor}`,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
      title: {
        display: true,
        text: `${dataLabel} Over Time`,
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? "white" : "black",
        },
      },
      y: {
        ticks: {
          color: isDark ? "white" : "black",
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

const DoughnutChart = ({ data, isLoading = false }) => {
  const chartRef = useRef(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: "easeOutCirc",
      onComplete: () => setAnimationComplete(true),
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      setAnimationComplete(false);
    }
  }, [data]);

  return (
    <div
      className="relative mx-auto flex justify-center items-center"
      style={{ width: "100%", maxWidth: "400px", height: "300px" }}>
      <Doughnut ref={chartRef} data={chartData} options={options} />

      {data.map((item, index) => {
        const dataTotal = data.reduce((total, item) => total + item.value, 0);
        const angle =
          -90 +
          data
            .slice(0, index)
            .reduce((total, item) => total + item.value * 3.6, 0) +
          (item.value * 3.6) / 2;
        const radius = 150;

        // Calculate X and Y for label positioning, but now centered
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180); // center it horizontally
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180); // center it vertically

        return (
          <div
            key={index}
            className={`absolute text-sm font-medium transition-opacity duration-1000 ${
              animationComplete ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)", // Correct alignment
              color: item.color,
            }}>
            {/* {item.label} {item.value}% */}
          </div>
        );
      })}
    </div>
  );
};

const MultiLineChart = ({ data, isLoading = false }) => {
  const chartRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({
    time: "",
    max: 0,
    min: 0
  });
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  // Ensure we have valid data before trying to use it
  const safeData = Array.isArray(data) ? data : [];

  const chartData = {
    labels: safeData.map((item) => item.time),
    datasets: [
      {
        label: "Max",
        data: safeData.map((item) => item.max),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.4,
        pointRadius: 5,
      },
      {
        label: "Min",
        data: safeData.map((item) => item.min),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        enabled: true,
      },
    },
    animation: { duration: 1000, easing: "easeOutQuad" },
  };

  return (
    <div className="relative h-full w-full">
      <Line ref={chartRef} data={chartData} options={options} />
      {tooltipVisible && (
        <div
          className="absolute z-10 rounded bg-gray-900 p-3 text-white shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -130%)",
          }}>
          <div className="mb-1 font-medium">{tooltipData.time}</div>
          <div className="flex items-center text-blue-400">
            Max: <span className="ml-2 font-medium">{tooltipData.max}</span>
          </div>
          <div className="flex items-center text-green-400">
            Min: <span className="ml-2 font-medium">{tooltipData.min}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Import and add the ForecastChart component
const ForecastChart = ({ data, isLoading = false }) => {
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  // Format timestamps to be more readable (in UTC/GMT time)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: 'UTC' // Ensures time matches original GMT timestamp
    });
  };

  const chartData = {
    labels: data.map((item) => formatTime(item.timestamp)),
    datasets: [
      {
        label: "Temperature (°C)",
        data: data.map((item) => item.temperature),
        borderColor: "#f97316", // orange-500
        backgroundColor: "#f97316",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#f97316",
        pointBorderColor: isDark ? "#111827" : "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        yAxisID: "y",
      },
      {
        label: "Soil Moisture (%)",
        data: data.map((item) => item.humidity),
        borderColor: "#3b82f6", // blue-500
        backgroundColor: "#3b82f6",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: isDark ? "#111827" : "#ffffff",
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Temperature (°C)",
          color: isDark ? "#f97316" : "#f97316",
        },
        min: Math.floor(Math.min(...data.map((item) => item.temperature)) - 2),
        max: Math.ceil(Math.max(...data.map((item) => item.temperature)) + 2),
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: isDark ? "#f97316" : "#f97316",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Soil Moisture (%)",
          color: isDark ? "#3b82f6" : "#3b82f6",
        },
        min: Math.floor(Math.min(...data.map((item) => item.humidity)) - 5),
        max: Math.ceil(Math.max(...data.map((item) => item.humidity)) + 5),
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: isDark ? "#3b82f6" : "#3b82f6",
        },
      },
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#d1d5db" : "#4b5563",
          boxWidth: 12,
          padding: 20,
        },
      },
    },
    animation: {
      duration: 2000,
      easing: "easeOutQuad",
    },
  };

  return <Line data={chartData} options={options} />;
};

const WaterUsageChart = ({ data, isLoading = false }) => {
  const isDark = useDarkMode();

  if (isLoading || !data || data.length === 0) {
    return <LoadingSpinner />;
  }

  // Function to format the ISO timestamp to readable format
  const formatISOTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return isoString;
    }
  };

  // Create labels with start and end times
  const labels = data.map(item => {
    try {
      const startTime = formatISOTime(item.startTimestamp);
      const endTime = formatISOTime(item.endTimestamp);
      return `${startTime} - ${endTime}`;
    } catch (error) {
      console.error("Error creating label:", error);
      return "Invalid Time";
    }
  });

  // Format date for better display
  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return isoString;
    }
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Water Usage (Liters)',
        data: data.map(item => item.waterUsageLiters),
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#d1d5db' : '#4b5563',
        }
      },
      title: {
        display: true,
        text: 'Water Usage by Irrigation Session',
        color: isDark ? '#f3f4f6' : '#1f2937',
        font: {
          size: 16,
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        callbacks: {
          title: function(tooltipItems) {
            // Get the date from the recordedAt property to show in title
            const index = tooltipItems[0].dataIndex;
            const item = data[index];
            return formatDate(item.recordedAt);
          },
          afterLabel: function(context) {
            const index = context.dataIndex;
            const item = data[index];
            return [
              `Start: ${formatISOTime(item.startTimestamp)}`,
              `End: ${formatISOTime(item.endTimestamp)}`,
              `Duration: ${item.durationMinutes.toFixed(1)} min`,
              `Efficiency: ${(item.waterUsageLiters / item.durationMinutes).toFixed(2)} L/min`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Water Usage (Liters)',
          color: isDark ? '#d1d5db' : '#4b5563',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#d1d5db' : '#4b5563',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Session Time Range',
          color: isDark ? '#d1d5db' : '#4b5563',
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#d1d5db' : '#4b5563',

        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export { LineChart, BarChart, AreaChart, DoughnutChart, MultiLineChart, ForecastChart, WaterUsageChart };