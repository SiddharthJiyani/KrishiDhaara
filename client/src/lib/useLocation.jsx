import { useState, useEffect } from "react";
import axios from "axios";

const useLocation = (initialLocation = "New Delhi, India") => {
  const [location, setLocation] = useState(initialLocation);
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [suggestions, setSuggestions] = useState([]);

  const fetchCoordinates = async (locationName) => {
    try {
      let response;
      if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(locationName)) {
        // If the input is latitude,longitude -> Use Reverse Geocoding
        const [lat, lon] = locationName.split(",").map((val) => val.trim());
        response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
      } else {
        // If the input is a place name -> Use Forward Geocoding
        const searchTerm = locationName.toLowerCase().includes("india")
          ? locationName
          : `${locationName}, India`;
        response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&countrycodes=in&limit=1`
        );
      }
  
      const data = response.data;
      
      if (data && (data.lat || data[0]?.lat)) {
        const { lat, lon, display_name } = data.lat ? data : data[0];
        setLatitude(Number(lat));
        setLongitude(Number(lon));
        setLocation(display_name);
      } else {
        console.error("Location not found");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };
  

  const fetchPlaceSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}, India&countrycodes=in&limit=5`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
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
        }
      );
    }
  }, []);

  return {
    location,
    setLocation,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    suggestions,
    fetchCoordinates,
    fetchPlaceSuggestions,
  };
};

export default useLocation;
