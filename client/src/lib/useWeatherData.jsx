import { useState, useEffect } from "react";

const useWeatherData = (lat, lon) => {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,precipitation_probability`
        );
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    if (lat && lon) {
      fetchWeatherData();
    }
  }, [lat, lon]);

  return weatherData;
};

export default useWeatherData;
