import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
// Import Firebase functionality
import { ref, onValue } from 'firebase/database';
import { database, secondaryDatabase } from "../lib/firebase";

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Backend URL for API calls
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create custom sensor icons
const createSensorIcon = (color, isAlert = false) => {
  return L.divIcon({
    className: 'custom-sensor-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isAlert ? 'red' : 'white'}; box-shadow: 0 0 ${isAlert ? '8px rgba(255,0,0,0.7)' : '5px rgba(0,0,0,0.5)'};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Create location button icon
const locationButtonIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="#14c817" width="24px" height="24px" viewBox="0 0 395.71 395.71" stroke="#14c817">
    <g>
      <path d="M197.849,0C122.131,0,60.531,61.609,60.531,137.329c0,72.887,124.591,243.177,129.896,250.388l4.951,6.738 c0.579,0.792,1.501,1.255,2.471,1.255c0.985,0,1.901-0.463,2.486-1.255l4.948-6.738c5.308-7.211,129.896-177.501,129.896-250.388 C335.179,61.609,273.569,0,197.849,0z M197.849,88.138c27.13,0,49.191,22.062,49.191,49.191c0,27.115-22.062,49.191-49.191,49.191 c-27.114,0-49.191-22.076-49.191-49.191C148.658,110.2,170.734,88.138,197.849,88.138z"/>
    </g>
  </svg>
`;

// Component to update map view when location changes
function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      // Use setView instead of flyTo for immediate location jumps without animation
      map.setView(center, 16, { animate: false });
    }
  }, [center, map]);
  
  return null;
}

// Function to generate a field boundary based on center and dimensions
const generateFieldBoundary = (center, width, height) => {
  // Convert meters to approximate latitude/longitude changes
  // This is a simplification and works best near the equator
  const metersToLat = 1 / 111111; // 1 meter in latitude degrees
  const metersToLng = 1 / (111111 * Math.cos(center[0] * (Math.PI / 180))); // 1 meter in longitude degrees
  
  const halfWidthDeg = (width / 2) * metersToLng;
  const halfHeightDeg = (height / 2) * metersToLat;
  
  // Create a simple rectangular boundary
  return [
    [center[0] - halfHeightDeg, center[1] - halfWidthDeg], // Bottom left
    [center[0] - halfHeightDeg, center[1] + halfWidthDeg], // Bottom right
    [center[0] + halfHeightDeg, center[1] + halfWidthDeg], // Top right
    [center[0] + halfHeightDeg, center[1] - halfWidthDeg]  // Top left
  ];
};

// Generate a random color
const getRandomColor = () => {
  const colors = [
    '#3388ff', // Blue
    '#33ff88', // Green
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const FarmMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [fieldCenter, setFieldCenter] = useState(null); // Store field center separately
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [isLocating, setIsLocating] = useState(false);
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [fieldWidth, setFieldWidth] = useState(100);
  const [fieldHeight, setFieldHeight] = useState(100);
  const [fieldBoundary, setFieldBoundary] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [allSensorList, setAllSensorList] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [showSensorPanel, setShowSensorPanel] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  // Add state for anomaly data
  const [anomalyData, setAnomalyData] = useState({
    soil_moisture: false,
    temperature: false
  });
  // Add state for notifications
  const [notifications, setNotifications] = useState([]);
  // Ref to track previous anomaly state to prevent duplicate notifications
  const previousAnomalyRef = useRef({
    soil_moisture: false,
    temperature: false
  });

  // Load field dimensions from local storage
  const loadFieldDimensions = () => {
    const savedDimensions = localStorage.getItem('fieldDimensions');
    if (savedDimensions) {
      try {
        const parsedDimensions = JSON.parse(savedDimensions);
        setFieldWidth(parsedDimensions.width);
        setFieldHeight(parsedDimensions.height);
        if (parsedDimensions.center) {
          setFieldCenter(parsedDimensions.center);
        }
        return true;
      } catch (error) {
        console.error("Error parsing saved field dimensions:", error);
      }
    }
    return false;
  };

  // Save field dimensions to local storage
  const saveFieldDimensions = (width, height, center) => {
    localStorage.setItem('fieldDimensions', JSON.stringify({
      width,
      height,
      center
    }));
    setShowResetButton(true);
  };

  // Get current location on initial render
  useEffect(() => {
    // First check if field dimensions are saved
    const dimensionsExist = loadFieldDimensions();
    
    // If dimensions exist, don't show the modal on initial load
    if (dimensionsExist) {
      setShowResetButton(true);
    }
    
    // Get user location regardless
    getCurrentLocation(!dimensionsExist);
    
    // Load saved sensor locations from local storage
    loadSensorLocations();
  }, []);

  // Store anomaly status in a ref to persist across renders
  const anomalyStatusRef = useRef({
    soil_moisture: false,
    temperature: false
  });
  
  // Setup Firebase listeners
  useEffect(() => {
    // Reference to relay sensors suggestion (if needed)
    const dbRef = ref(database, "/relay-sensors-suggestion");
    
    // Reference to anomaly data
    const secdbRef = ref(secondaryDatabase, "/anomaly");
    
    console.log("Setting up Firebase listeners...");
    
    // Listen for anomaly changes
    const unsubscribe = onValue(secdbRef, (snapshot) => {
      if (snapshot.exists()) {
        const newAnomalyData = snapshot.val();
        console.log("Anomaly data received:", newAnomalyData);
        
        // Store the anomaly data in a ref for persistence
        anomalyStatusRef.current = newAnomalyData;
        
        // Update the state (for UI rendering)
        setAnomalyData({...newAnomalyData});
        
        const newNotifications = [];
        
        // Check for soil moisture anomaly
        if (newAnomalyData.soil_moisture !== undefined && 
            previousAnomalyRef.current.soil_moisture !== newAnomalyData.soil_moisture) {
          if (newAnomalyData.soil_moisture) {
            newNotifications.push({
              id: "soil_moisture_" + Date.now(),
              sensorNumber: "Soil Moisture Anomaly",
              state: "alert",
              type: "error",
              timestamp: new Date().toISOString(),
              message: "Abnormal soil moisture levels detected! Please check your irrigation system."
            });
          }
          previousAnomalyRef.current.soil_moisture = newAnomalyData.soil_moisture;
        }
        
        // Check for temperature anomaly
        if (newAnomalyData.temperature !== undefined && 
            previousAnomalyRef.current.temperature !== newAnomalyData.temperature) {
          if (newAnomalyData.temperature) {
            newNotifications.push({
              id: "temperature_" + Date.now(),
              sensorNumber: "Temperature Anomaly",
              state: "alert",
              type: "error",
              timestamp: new Date().toISOString(),
              message: "Abnormal temperature detected! Plants may be at risk."
            });
          }
          previousAnomalyRef.current.temperature = newAnomalyData.temperature;
        }
        
        if (newNotifications.length > 0) {
          console.log("Adding new notifications:", newNotifications);
          setNotifications((prev) => [...newNotifications, ...prev]);
        }
        
        // Always update sensor statuses whenever anomaly data changes
        updateSensorStatusesFromAnomalies(newAnomalyData);
      } else {
        console.log("No anomaly data found in Firebase");
      }
    }, (error) => {
      console.error("Error fetching anomaly data:", error);
    });
    
    // Cleanup function to unsubscribe from Firebase
    return () => {
      console.log("Cleaning up Firebase listeners");
      unsubscribe();
    };
  }, []); // Empty dependency array to ensure this runs only once

  // Function to update sensor statuses based on anomaly data
  const updateSensorStatusesFromAnomalies = (anomalyData) => {
    console.log("Updating sensor statuses from anomalies:", anomalyData);
    
    // Store the anomaly data locally in a variable to ensure it persists
    const currentAnomalyState = {...anomalyData};
    
    setSensors(prevSensors => {
      // If there are no sensors yet, don't do anything
      if (prevSensors.length === 0) {
        return prevSensors;
      }
      
      const updatedSensors = prevSensors.map(sensor => {
        // Make a copy of the sensor to avoid mutation
        const updatedSensor = {...sensor};
        
        // Check for soil moisture sensor
        if (updatedSensor.id === 'soilmoist1') {
          updatedSensor.status = currentAnomalyState.soil_moisture ? 'alert' : 'normal';
        } 
        // Check for temperature sensor
        else if (updatedSensor.id === 'temp1') {
          updatedSensor.status = currentAnomalyState.temperature ? 'alert' : 'normal';
        }
        
        return updatedSensor;
      });
      
      console.log("Updated sensors:", updatedSensors);
      return updatedSensors;
    });
    
    // Also schedule fetchSensorData after a short delay to ensure the sensors are updated
    setTimeout(() => {
      fetchSensorData(anomalyData);
    }, 300);
  };

  // Update field boundary when dimensions or field center changes
  useEffect(() => {
    if (fieldCenter) {
      const boundary = generateFieldBoundary(fieldCenter, fieldWidth, fieldHeight);
      setFieldBoundary(boundary);
    }
  }, [fieldWidth, fieldHeight, fieldCenter]);

  // Fetch sensor data when user location is available
  useEffect(() => {
    if (userLocation) {
      console.log("User location available, fetching sensor data");
      fetchAllSensorList();
      // Use a timeout to make sure the anomaly data has been loaded first
      setTimeout(() => {
        fetchSensorData();
      }, 500);
    }
  }, [userLocation]);
  
  // Re-apply anomaly status whenever anomalyData changes
  useEffect(() => {
    if (sensors.length > 0) {
      console.log("Anomaly data changed, updating sensors:", anomalyData);
      updateSensorStatusesFromAnomalies(anomalyData);
    }
  }, [anomalyData]);

  // Load sensor locations from local storage
  const loadSensorLocations = () => {
    const savedLocations = localStorage.getItem('sensorLocations');
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations);
        // We'll update the sensors state later when we have the sensor list
        return parsedLocations;
      } catch (error) {
        console.error("Error parsing saved sensor locations:", error);
      }
    }
    return {};
  };

  // Save sensor locations to local storage
  const saveSensorLocations = (locations) => {
    localStorage.setItem('sensorLocations', JSON.stringify(locations));
  };
  
  // Function to get user's current location with high precision
  const getCurrentLocation = (showModal = false) => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      const geoOptions = { 
        enableHighAccuracy: true,  // Force high accuracy GPS reading
        timeout: 10000,            // Increased timeout for better readings
        maximumAge: 0              // Don't use cached position
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Location accuracy: ${accuracy} meters`);
          
          const newLocation = [latitude, longitude];
          
          // Set user location
          setUserLocation(newLocation);
          
          // Set map center to user location
          setMapCenter(newLocation);
          
          // Only set field center if it doesn't exist yet
          if (!fieldCenter) {
            setFieldCenter(newLocation);
          }
          
          setIsLocating(false);
          
          // Show dimensions modal only if requested and no saved dimensions
          if (showModal) {
            setShowDimensionsModal(true);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert("Unable to get your location. Please make sure location services are enabled.");
        },
        geoOptions
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  // Function to handle dimension form submission
  const handleDimensionsSubmit = () => {
    if (!userLocation) return;
    
    // Save field center as current user location if not set yet
    const center = fieldCenter || userLocation;
    
    // Generate field boundary based on dimensions
    const boundary = generateFieldBoundary(center, fieldWidth, fieldHeight);
    setFieldBoundary(boundary);
    
    // Save dimensions and center to local storage
    saveFieldDimensions(fieldWidth, fieldHeight, center);
    
    // Hide modal
    setShowDimensionsModal(false);
  };

  // Function to reset field dimensions
  const resetFieldDimensions = () => {
    // Remove saved dimensions from local storage
    localStorage.removeItem('fieldDimensions');
    
    // Reset field center
    setFieldCenter(null);
    
    // Clear field boundary
    setFieldBoundary([]);
    
    // Show dimensions modal
    setShowDimensionsModal(true);
    
    // Hide reset button
    setShowResetButton(false);
  };

  // Function to fetch sensor data with optional anomaly override
  const fetchSensorData = async (anomalyOverride = null) => {
    try {
      console.log("Fetching sensor data from API...");
      const response = await axios.get(`${BACKEND_URL}/SensorData/getLatest`, {
        withCredentials: true,
      });
      
      console.log("Raw API response:", response.data);
      const data = response.data.message;
      
      // Format data to match expected structure
      const formattedData = {};
      
      // Get current anomaly status - either from the passed override or from the ref
      const currentAnomalyStatus = anomalyOverride || anomalyStatusRef.current;
      console.log("Using anomaly status for sensor data:", currentAnomalyStatus);
      
      // Handle temperature data (from resultTemp)
      if (data && data.resultTemp && data.resultTemp.metadata) {
        const sensorId = data.resultTemp.metadata.sensorNumber;
        formattedData[sensorId] = {
          value: data.resultTemp.temperature,
          status: currentAnomalyStatus.temperature ? 'alert' : 'normal',
          type: 'temperature',
          timestamp: data.resultTemp.timestamp
        };
        console.log(`Temperature sensor (${sensorId}) data processed:`, formattedData[sensorId]);
      }
      
      // Handle humidity/soil moisture data (from resultHumi)
      if (data && data.resultHumi && data.resultHumi.metadata) {
        const sensorId = data.resultHumi.metadata.sensorNumber;
        formattedData[sensorId] = {
          value: data.resultHumi.humidity,
          status: currentAnomalyStatus.soil_moisture ? 'alert' : 'normal',
          type: 'humidity',
          timestamp: data.resultHumi.timestamp
        };
        console.log(`Humidity sensor (${sensorId}) data processed:`, formattedData[sensorId]);
      }
      console.log('Formatted sensor data:', formattedData);
      setSensorData(formattedData);
      console.log('All formatted sensor data:', formattedData);
      
      // Update sensors with the new data
      updateSensorsWithData(formattedData, currentAnomalyStatus);
      
      // If we have data, make sure soil moisture and temperature sensors are included in the list
      if ((data.resultTemp || data.resultHumi) && sensors.length === 0) {
        const baseSensors = [];
        
        if (data.resultTemp) {
          baseSensors.push({
            id: data.resultTemp.metadata.sensorNumber,
            name: 'Temperature Sensor',
            type: 'temperature',
            value: data.resultTemp.temperature,
            status: currentAnomalyStatus.temperature ? 'alert' : 'normal'
          });
        }
        
        if (data.resultHumi) {
          baseSensors.push({
            id: data.resultHumi.metadata.sensorNumber,
            name: 'Soil Moisture Sensor', 
            type: 'humidity',
            value: data.resultHumi.humidity,
            status: currentAnomalyStatus.soil_moisture ? 'alert' : 'normal'
          });
        }
        
        if (baseSensors.length > 0) {
          setAllSensorList(baseSensors);
          processSensorData(baseSensors, currentAnomalyStatus);
        }
      }
      
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      // Use sample data if API fails
      useSampleSensorData();
    }
  };

  // Update sensors with data and respect anomaly status
  const updateSensorsWithData = (data, anomalyOverride = null) => {
    console.log("Updating sensors with new data:", data);
    
    // Get current anomaly status - either from override or from the ref
    const currentAnomalyStatus = anomalyOverride || anomalyStatusRef.current;
    
    setSensors(prevSensors => {
      // If no sensors exist yet, create them
      if (prevSensors.length === 0 && Object.keys(data).length > 0) {
        const newSensors = Object.entries(data).map(([id, sensorData], index) => {
          // Generate default position if user location exists
          const position = userLocation ? [
            userLocation[0] + (Math.cos(index * Math.PI) * 0.001),
            userLocation[1] + (Math.sin(index * Math.PI) * 0.001)
          ] : [0, 0];
          
          // Determine status based on id and anomaly status
          let status = sensorData.status;
          if (id === 'temp1') {
            status = currentAnomalyStatus.temperature ? 'alert' : 'normal';
          } else if (id === 'soilmoist1') {
            status = currentAnomalyStatus.soil_moisture ? 'alert' : 'normal';
          }
          
          return {
            id,
            name: id === 'temp1' ? 'Temperature Sensor' : 
                 id === 'soilmoist1' ? 'Soil Moisture Sensor' : 
                 `Sensor ${id}`,
            position,
            color: getRandomColor(),
            value: sensorData.value,
            status: status,
            type: sensorData.type
          };
        });
        console.log("Created new sensors:", newSensors);
        return newSensors;
      }
      
      // Otherwise update existing sensors while preserving anomaly status
      const updatedSensors = prevSensors.map(sensor => {
        // Start with a copy of the sensor
        const updatedSensor = {...sensor};
        
        // If we have new data for this sensor, update value and type
        if (data[sensor.id]) {
          updatedSensor.value = data[sensor.id].value;
          updatedSensor.type = data[sensor.id].type;
        }
        
        // Always set status based on current anomaly information
        if (updatedSensor.id === 'temp1') {
          updatedSensor.status = currentAnomalyStatus.temperature ? 'alert' : 'normal';
        } else if (updatedSensor.id === 'soilmoist1') {
          updatedSensor.status = currentAnomalyStatus.soil_moisture ? 'alert' : 'normal';
        }
        
        return updatedSensor;
      });
      
      console.log("Updated existing sensors:", updatedSensors);
      return updatedSensors;
    });
  };

  // Function to fetch all sensor types
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
      console.log('Sensor Types:', sensorTypes);
      setAllSensorList(sensorTypes);
      
      // Generate sensor data and positions
      processSensorData(sensorTypes);
    } catch (error) {
      console.error("Error fetching sensor list:", error);
      // Use sample data if API fails
      useSampleSensorData();
    }
  };

  // Process sensor data and create positions with anomaly awareness
  const processSensorData = (sensorList, anomalyOverride = null) => {
    if (!userLocation || !sensorList || sensorList.length === 0) {
      console.log("Unable to process sensor data: missing location or sensor list");
      return;
    }
    
    console.log("Processing sensor list:", sensorList);
    
    // Get current anomaly status - either from override or from the ref
    const currentAnomalyStatus = anomalyOverride || anomalyStatusRef.current;
    console.log("Using anomaly status for processing:", currentAnomalyStatus);
    
    // Check for saved locations
    const savedLocations = loadSensorLocations();
    console.log("Loaded saved locations:", savedLocations);
    
    // Create a map to store sensor colors for consistency
    const colorMap = {};
    
    // Map the sensor list to sensors with positions and colors
    const positionedSensors = sensorList.map((sensor, index) => {
      // Generate a unique id if not available
      const sensorId = typeof sensor === 'object' && sensor.id ? sensor.id : 
                       typeof sensor === 'string' ? sensor : `sensor-${index}`;
                       
      // Generate name if not available
      let sensorName;
      if (typeof sensor === 'object' && sensor.name) {
        sensorName = sensor.name;
      } else if (sensorId === 'temp1') {
        sensorName = 'Temperature Sensor';
      } else if (sensorId === 'soilmoist1') {
        sensorName = 'Soil Moisture Sensor';
      } else {
        sensorName = `Sensor ${index + 1}`;
      }
      
      // Use saved location or generate a new one
      let position;
      if (savedLocations[sensorId]) {
        position = savedLocations[sensorId];
      } else {
        // Generate position within field boundary or default to a position around user
        const angle = (index / sensorList.length) * 2 * Math.PI;
        const distance = 0.001; // Approximately 100m depending on latitude
        position = [
          userLocation[0] + Math.cos(angle) * distance,
          userLocation[1] + Math.sin(angle) * distance
        ];
      }
      
      // Use consistent color for the same sensor or generate a new one
      if (!colorMap[sensorId]) {
        colorMap[sensorId] = getRandomColor();
      }
      
      // Determine status based on sensor id and anomaly status
      let status;
      if (sensorId === 'soilmoist1') {
        status = currentAnomalyStatus.soil_moisture ? 'alert' : 'normal';
      } else if (sensorId === 'temp1') {
        status = currentAnomalyStatus.temperature ? 'alert' : 'normal';
      } else if (typeof sensor === 'object' && sensor.status) {
        status = sensor.status;
      } else {
        status = 'normal';
      }
      
      // Get sensor type (temperature, humidity, etc.)
      let type = 'unknown';
      if (typeof sensor === 'object' && sensor.type) {
        type = sensor.type;
      } else if (sensorId === 'temp1') {
        type = 'temperature';
      } else if (sensorId === 'soilmoist1') {
        type = 'humidity';
      }
      
      // Get sensor value 
      let value;
      if (typeof sensor === 'object' && sensor.value !== undefined) {
        value = sensor.value;
      } else if (sensorData[sensorId]) {
        value = sensorData[sensorId].value;
      } else {
        value = Math.floor(Math.random() * 100);
      }
      
      const positionedSensor = {
        id: sensorId,
        name: sensorName,
        position: position,
        color: colorMap[sensorId],
        type: type,
        value: value,
        status: status
      };
      
      console.log(`Processed sensor ${sensorId}:`, positionedSensor);
      return positionedSensor;
    });
    
    console.log("Setting positioned sensors:", positionedSensors);
    setSensors(positionedSensors);
  };

  // Use sample sensor data if API fails
  const useSampleSensorData = () => {
    if (!userLocation) {
      console.log("Cannot use sample data: user location not available");
      return;
    }
    
    // Get current anomaly status from the ref for persistence
    const currentAnomalyStatus = anomalyStatusRef.current;
    console.log("Using sample sensor data with anomaly status:", currentAnomalyStatus);
    
    const sampleSensors = [
      { 
        id: 'temp1', 
        name: 'Temperature Sensor 1', 
        type: 'temperature', 
        value: 26.5, 
        status: currentAnomalyStatus.temperature ? 'alert' : 'normal' 
      },
      { 
        id: 'soilmoist1', 
        name: 'Soil Moisture Sensor 1', 
        type: 'humidity', 
        value: 27, 
        status: currentAnomalyStatus.soil_moisture ? 'alert' : 'normal' 
      }
    ];
    
    // Create formatted sensor data structure
    const formattedData = {};
    sampleSensors.forEach(sensor => {
      formattedData[sensor.id] = {
        value: sensor.value,
        status: sensor.status,
        type: sensor.type
      };
    });
    
    console.log("Setting sample sensor data:", formattedData);
    setSensorData(formattedData);
    
    setAllSensorList(sampleSensors);
    processSensorData(sampleSensors, currentAnomalyStatus);
  };

  // Function to update sensor's location with current user location
  const updateSensorLocation = (sensorId) => {
    if (!userLocation) return;
    
    // Get current saved locations
    const savedLocations = loadSensorLocations();
    
    // Update location for the selected sensor
    savedLocations[sensorId] = [...userLocation];
    
    // Save to local storage
    saveSensorLocations(savedLocations);
    
    // Update sensors state
    setSensors(prevSensors => prevSensors.map(sensor => {
      if (sensor.id === sensorId) {
        return {
          ...sensor,
          position: [...userLocation]
        };
      }
      return sensor;
    }));
    
    alert(`Location for sensor ${sensorId} has been updated!`);
  };
  
  // Function to reset a sensor's location
  const resetSensorLocation = (sensorId) => {
    if (!userLocation) return;
    
    // Get current saved locations
    const savedLocations = loadSensorLocations();
    
    // Remove this sensor's saved location
    if (savedLocations[sensorId]) {
      delete savedLocations[sensorId];
      
      // Save updated locations to local storage
      saveSensorLocations(savedLocations);
      
      // Generate a default position for this sensor
      const sensorIndex = sensors.findIndex(s => s.id === sensorId);
      const totalSensors = sensors.length;
      const angle = (sensorIndex / totalSensors) * 2 * Math.PI;
      const distance = 0.001; // Approximately 100m depending on latitude
      const defaultPosition = [
        userLocation[0] + Math.cos(angle) * distance,
        userLocation[1] + Math.sin(angle) * distance
      ];
      
      // Update sensors state
      setSensors(prevSensors => prevSensors.map(sensor => {
        if (sensor.id === sensorId) {
          return {
            ...sensor,
            position: defaultPosition
          };
        }
        return sensor;
      }));
      
      alert(`Location for sensor ${sensorId} has been reset to default position.`);
    }
  };

  // Format sensor value with unit
  const formatSensorValue = (sensor) => {
    switch(sensor.type) {
      case 'temperature': return `${sensor.value}°C`;
      case 'humidity': return `${sensor.value}%`;
      default: return sensor.value;
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%', position: 'relative', zIndex: 10 }}>
      {/* Dimensions Modal */}
      {showDimensionsModal && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ marginTop: 0 }}>Enter Your Field Dimensions</h2>
            <p>Please enter the dimensions of your field:</p>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="field-width" style={{ display: 'block', marginBottom: '5px' }}>
                Width (meters):
              </label>
              <input
                id="field-width"
                type="number"
                value={fieldWidth}
                onChange={(e) => setFieldWidth(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                min="10"
                max="1000"
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="field-height" style={{ display: 'block', marginBottom: '5px' }}>
                Height (meters):
              </label>
              <input
                id="field-height"
                type="number"
                value={fieldHeight}
                onChange={(e) => setFieldHeight(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                min="10"
                max="1000"
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDimensionsSubmit}
                style={{
                  backgroundColor: '#14c817',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Panel Button */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setShowSensorPanel(!showSensorPanel)}
          style={{
            backgroundColor: '#fff',
            color: '#3388ff',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showSensorPanel ? 'Hide Sensors' : 'Show Sensors'}
        </button>
      </div>

      {/* Reset Field Dimensions Button */}
      {showResetButton && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '165px',
          zIndex: 1000
        }}>
          <button 
            onClick={resetFieldDimensions}
            style={{
              backgroundColor: '#fff',
              color: '#ff3838',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reset Field Dimensions
          </button>
        </div>
      )}

      {/* Notifications Badge */}
      {notifications.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#ff3838',
          color: 'white',
          borderRadius: '50%',
          width: '25px',
          height: '25px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        }}>
          {notifications.length}
        </div>
      )}

      {/* Sensor Panel */}
      {showSensorPanel && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '15px',
          width: '250px',
          maxHeight: '60vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ marginTop: 0 }}>Sensors</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Click the location icon to update sensor position to your current location
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sensors.map(sensor => (
              <li key={sensor.id} style={{ 
                padding: '10px', 
                marginBottom: '8px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                borderLeft: `4px solid ${sensor.color}`,
                border: sensor.status === 'alert' ? '2px solid red' : 'none',
                boxShadow: sensor.status === 'alert' ? '0 0 8px rgba(255, 0, 0, 0.5)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{sensor.name}</div>
                    {sensor.value && (
                      <div style={{ fontSize: '14px' }}>
                        {formatSensorValue(sensor)}
                      </div>
                    )}
                    {sensor.status === 'alert' && (
                      <div style={{ color: 'red', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                        ANOMALY DETECTED!
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateSensorLocation(sensor.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#14c817'
                    }}
                    title="Set current location as sensor position"
                    dangerouslySetInnerHTML={{ __html: locationButtonIcon }}
                  ></button>
                  <button
                    onClick={() => resetSensorLocation(sensor.id)}
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      marginLeft: '5px',
                      cursor: 'pointer'
                    }}
                    title="Reset sensor location to default"
                  >
                    Reset
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Location button */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => getCurrentLocation(false)} // Don't show modal when updating location
          disabled={isLocating}
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: isLocating ? '#cccccc' : '#fff',
            color: isLocating ? '#999' : '#3388ff',
            border: 'none',
            borderRadius: '50%',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLocating ? 'default' : 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Get my location"
          title="Get my location"
          dangerouslySetInnerHTML={{ __html: locationButtonIcon }}
        >
        </button>
      </div>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-icon {
            animation: spin 1s linear infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
          }
          .alert-sensor {
            animation: pulse 1.5s infinite;
          }
        `}
      </style>
      
      <MapContainer 
        center={userLocation || [0, 0]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
      >
        {userLocation && <MapUpdater center={mapCenter} />}
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        {/* Field boundary */}
        {fieldBoundary.length > 0 && (
          <Polygon 
            positions={fieldBoundary}
            pathOptions={{ color: 'green', weight: 3, fillColor: 'green', fillOpacity: 0.1 }}
          />
        )}
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div>
                <strong>Your Current Location</strong>
                <p>Lat: {userLocation[0].toFixed(6)}</p>
                <p>Lng: {userLocation[1].toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Sensor markers */}
        {sensors.map(sensor => (
          <Marker 
            key={sensor.id}
            position={sensor.position}
            icon={createSensorIcon(sensor.color, sensor.status === 'alert')}
            className={sensor.status === 'alert' ? 'alert-sensor' : ''}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  borderBottom: `2px solid ${sensor.color}`, 
                  paddingBottom: '5px',
                  color: sensor.status === 'alert' ? 'red' : 'inherit'
                }}>
                  {sensor.name}
                  {sensor.status === 'alert' && ' (ANOMALY)'}
                </h3>
                {sensor.value && (
                  <p style={{ 
                    margin: '5px 0',
                    fontWeight: sensor.status === 'alert' ? 'bold' : 'normal',
                    color: sensor.status === 'alert' ? 'red' : 'inherit'
                  }}>
                    <strong>Value:</strong> {formatSensorValue(sensor)}
                  </p>
                )}
                {sensor.status && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      color: sensor.status === 'normal' ? 'green' : sensor.status === 'high' ? 'orange' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {` ${sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}`}
                    </span>
                  </p>
                )}
                <p style={{ margin: '5px 0' }}>
                  <strong>Position:</strong><br/>
                  Lat: {sensor.position[0].toFixed(6)}<br/>
                  Lng: {sensor.position[1].toFixed(6)}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '10px' 
                }}>
                  <button
                    onClick={() => updateSensorLocation(sensor.id)}
                    style={{
                      backgroundColor: '#14c817',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                    className=' w-fit'
                  >
                    <span dangerouslySetInnerHTML={{ __html: locationButtonIcon.replace('width="24px" height="24px"', 'width="16px" height="16px"') }}></span>
                    Update Location
                  </button>
                  <button
                    onClick={() => resetSensorLocation(sensor.id)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: '1'
                    }}
                  >
                    Reset Location
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Sensor range circles - pulsing animation for anomaly sensors */}
        {sensors.map(sensor => (
          <CircleMarker 
            key={`range-${sensor.id}`}
            center={sensor.position}
            radius={30}
            pathOptions={{ 
              color: sensor.status === 'alert' ? 'red' : sensor.color, 
              fillColor: sensor.status === 'alert' ? 'red' : sensor.color, 
              fillOpacity: sensor.status === 'alert' ? 0.2 : 0.1,
              weight: sensor.status === 'alert' ? 2 : 1 
            }}
            className={sensor.status === 'alert' ? 'alert-sensor' : ''}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default FarmMap;