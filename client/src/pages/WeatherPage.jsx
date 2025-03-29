import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Cloud,
  CloudRain,
  MapPin,
  Moon,
  Sun,
  Droplets,
  Wind,
} from "lucide-react";
import { motion } from "framer-motion";
import useWeatherData from "../lib/useWeatherData";
import useLocation from "../lib/useLocation";
import WeatherDayCard from "../components/Weather/WeatherDayCard";
import HourlyWeatherCard from "../components/Weather/HourlyWeatherCard";
import LocationSearch from "../components/Weather/LocationSearch";
import { LineChart } from "../components/charts";
import styled from "styled-components";

const renderWeatherIcon = (icon) => {
  switch (icon) {
    case "sun":
      return <Sun className="h-full w-full text-yellow-500" />;
    case "moon":
      return <Moon className="h-full w-full text-gray-300" />;
    case "cloud":
      return <Cloud className="h-full w-full text-blue-300" />;
    case "cloud-rain":
      return <CloudRain className="h-full w-full text-blue-500" />;
    default:
      return <Sun className="h-full w-full text-yellow-500" />;
  }
};

const WeatherPage = () => {
  const {
    location,
    setLocation,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    suggestions,
    fetchCoordinates,
    fetchPlaceSuggestions,
  } = useLocation();

  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState(location);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const weatherData = useWeatherData(latitude, longitude);

  const handleLocationChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchPlaceSuggestions(query);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationName = formatLocationName(suggestion);
    setLocation(locationName);
    setSearchQuery(locationName);
    setLatitude(Number(suggestion.lat));
    setLongitude(Number(suggestion.lon));
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      fetchCoordinates(searchQuery);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          fetchCoordinates(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Could not get your precise location. Please check your location permissions."
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      alert(
        "Geolocation is not supported by your browser. Please enter your location manually."
      );
    }
  };

  const handleClickOutside = (event) => {
    if (
      suggestionRef.current &&
      !suggestionRef.current.contains(event.target)
    ) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const StyledWrapper = styled.div`
    .loader {
      position: relative;
      width: 120px;
      height: 90px;
      margin: 0 auto;
    }
    .loader:before {
      content: "";
      position: absolute;
      bottom: 30px;
      left: 50px;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      background: #00a63e;
      animation: loading-bounce 0.5s ease-in-out infinite alternate;
    }
    .loader:after {
      content: "";
      position: absolute;
      right: 0;
      top: 0;
      height: 7px;
      width: 45px;
      border-radius: 4px;
      box-shadow: 0 5px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 95px 0 #f2f2f2;
      animation: loading-step 1s ease-in-out infinite;
    }
    @keyframes loading-bounce {
      0% {
        transform: scale(1, 0.7);
      }
      40% {
        transform: scale(0.8, 1.2);
      }
      60% {
        transform: scale(1, 1);
      }
      100% {
        bottom: 140px;
      }
    }
    @keyframes loading-step {
      0% {
        box-shadow: 0 10px 0 rgba(0, 0, 0, 0), 0 10px 0 #f2f2f2,
          -35px 50px 0 #f2f2f2, -70px 90px 0 #f2f2f2;
      }
      100% {
        box-shadow: 0 10px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 90px 0 #f2f2f2,
          -70px 90px 0 rgba(0, 0, 0, 0);
      }
    }
  `;

  const Loader = () => {
    return (
      <StyledWrapper>
        <div className="loader" />
      </StyledWrapper>
    );
  };

  if (!weatherData) {
    // return (
    //   <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
    //     <div className="text-center">
    //       <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
    //       <p className="text-xl">Getting precise location data...</p>
    //       <p className="text-sm text-gray-400 mt-2">
    //         Please allow location access for best results
    //       </p>
    //     </div>
    //   </div>
    // );
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
        <Loader />
      </div>
    );
  }

  const weekDays = [];
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    const dayData = {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      temp: "",
      low: "",
      high: "",
      icon: "",
      hourly: [],
      details: "",
    };

    const hourlyIndices = [0, 3, 6, 9, 12, 15, 18, 21];
    hourlyIndices.forEach((index) => {
      const hourData = {
        time: weatherData?.hourly.time[index + i * 24].split("T")[1],
        temp: weatherData?.hourly.temperature_2m[index + i * 24],
        humidity: weatherData?.hourly.precipitation_probability[index + i * 24],
        wind: weatherData?.hourly.wind_speed_10m[index + i * 24],
        icon:
          weatherData?.hourly.precipitation_probability[index + i * 24] > 50
            ? "cloud-rain"
            : "sun",
      };
      dayData.hourly.push(hourData);
    });

    dayData.temp = dayData.hourly[2].temp + "°C";
    dayData.low = Math.min(...dayData.hourly.map((hour) => hour.temp));
    dayData.high = Math.max(...dayData.hourly.map((hour) => hour.temp));
    dayData.details =
      dayData.icon === "cloud-rain"
        ? "Expect rain. Adjust irrigation accordingly."
        : "Clear skies. Proceed with regular irrigation.";

    weekDays.push(dayData);
  }

  const selectedDayData = weekDays[selectedDay];

  const hourlyData = selectedDayData.hourly.map((hour) => ({
    time: hour.time,
    value: hour.temp,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-200">
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
          <h1 className="text-3xl font-bold text-blue-400">
            Weather Prediction
          </h1>
          <p className="text-gray-300">
            7-day forecast to optimize your irrigation schedule
          </p>
        </motion.div>

        <LocationSearch
          searchQuery={searchQuery}
          onSearchQueryChange={handleLocationChange}
          onSearch={handleSearch}
          onCurrentLocation={handleCurrentLocation}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          onSuggestionClick={handleSuggestionClick}
          suggestionRef={suggestionRef}
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#121215] p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="mr-4 h-20 w-20">
                {renderWeatherIcon(selectedDayData.icon)}
              </div>
              <div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  <h2 className="text-xl font-bold line-clamp-2">{location}</h2>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {latitude && longitude
                    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : "Coordinates not available"}
                </div>
                <p className="text-gray-400">
                  {selectedDayData.day}, {selectedDayData.date}
                </p>
                <div className="text-5xl font-bold">{selectedDayData.temp}</div>
                <p className="text-gray-400">
                  H: {selectedDayData.high}° L: {selectedDayData.low}°
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-gray-700 pt-4">
              <p className="text-gray-300">{selectedDayData.details}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                  <span>Humidity: {selectedDayData.hourly[2].humidity}%</span>
                </div>
                <div className="flex items-center">
                  <Wind className="h-5 w-5 text-blue-400 mr-2" />
                  <span>Wind: {selectedDayData.hourly[2].wind} km/h</span>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-[#121215] p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <h3 className="font-medium mb-4">Temperature (°C)</h3>
            <div className="h-52">
              <LineChart data={hourlyData} color="#3b82f6" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}>
          <h3 className="text-xl font-medium mb-4">7-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {weekDays.map((day, index) => (
              <WeatherDayCard
                key={index}
                day={day}
                isSelected={selectedDay === index}
                onClick={() => setSelectedDay(index)}
                renderWeatherIcon={renderWeatherIcon}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-[#121215] p-6 rounded-lg shadow-lg backdrop-blur-sm mb-8">
          <h3 className="text-xl font-medium mb-4">
            Hourly Forecast for {selectedDayData.day}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedDayData.hourly.map((hour, index) => (
              <HourlyWeatherCard
                key={index}
                hour={hour}
                renderWeatherIcon={renderWeatherIcon}
              />
            ))}
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default WeatherPage;
