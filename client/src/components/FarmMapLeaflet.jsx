import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

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
const createSensorIcon = (color) => {
  return L.divIcon({
    className: 'custom-sensor-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
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
      map.flyTo(center, 16);
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
    '#ff3838', // Red
    '#33ff88', // Green
    '#ffff33', // Yellow
    '#ff33ff', // Magenta
    '#33ffff', // Cyan
    '#ff8833', // Orange
    '#8833ff'  // Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const FarmMap = () => {
  const [userLocation, setUserLocation] = useState(null);
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
  const [selectedSensorForLocation, setSelectedSensorForLocation] = useState(null);

  // Get current location on initial render
  useEffect(() => {
    getCurrentLocation();
    // Load saved sensor locations from local storage
    loadSensorLocations();
  }, []);

  // Fetch sensor data when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchAllSensorList();
      fetchSensorData();
    }
  }, [userLocation]);

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
  
  // Function to get user's current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = [latitude, longitude];
          
          // Set user location
          setUserLocation(newLocation);
          
          // Set map center to user location
          setMapCenter(newLocation);
          
          setIsLocating(false);
          
          // Show dimensions modal after getting location
          setShowDimensionsModal(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert("Unable to get your location. Please make sure location services are enabled.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  // Function to handle dimension form submission
  const handleDimensionsSubmit = () => {
    if (!userLocation) return;
    
    // Generate field boundary based on dimensions
    const boundary = generateFieldBoundary(userLocation, fieldWidth, fieldHeight);
    setFieldBoundary(boundary);
    setShowDimensionsModal(false);
  };

  // Function to fetch sensor data
  const fetchSensorData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/SensorData/getLatest`, {
        withCredentials: true,
      });
      const data = response.data.message;
      setSensorData(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      // Use sample data if API fails
      useSampleSensorData();
    }
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

  // Process sensor data and create positions
  const processSensorData = (sensorList) => {
    if (!userLocation || !sensorList || sensorList.length === 0) return;
    
    // Check for saved locations
    const savedLocations = loadSensorLocations();
    
    // Create a map to store sensor colors for consistency
    const colorMap = {};
    
    // Map the sensor list to sensors with positions and colors
    const positionedSensors = sensorList.map((sensor, index) => {
      // Generate a unique id if not available
      const sensorId = typeof sensor === 'object' ? sensor.id : `sensor-${index}`;
      const sensorName = typeof sensor === 'object' ? sensor.name : sensor;
      
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
      
      return {
        id: sensorId,
        name: sensorName,
        position: position,
        color: colorMap[sensorId],
        // Add type and value if available from sensorData
        type: typeof sensor === 'object' ? sensor.type : 'unknown',
        value: sensorData[sensorId] ? sensorData[sensorId].value : Math.floor(Math.random() * 100),
        status: sensorData[sensorId] ? sensorData[sensorId].status : 'normal'
      };
    });
    
    setSensors(positionedSensors);
  };

  // Use sample sensor data if API fails
  const useSampleSensorData = () => {
    if (!userLocation) return;
    
    const sampleSensors = [
      { id: 'sensor-1', name: 'Humidity Sensor 1', type: 'humidity', value: 65, status: 'normal' },
      { id: 'sensor-2', name: 'Temperature Sensor 1', type: 'temperature', value: 28, status: 'high' },
      { id: 'sensor-3', name: 'Moisture Sensor 1', type: 'moisture', value: 42, status: 'normal' },
      { id: 'sensor-4', name: 'Light Sensor 1', type: 'light', value: 890, status: 'normal' }
    ];
    
    setAllSensorList(sampleSensors);
    processSensorData(sampleSensors);
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
      case 'moisture': return `${sensor.value}%`;
      case 'temperature': return `${sensor.value}°C`;
      case 'humidity': return `${sensor.value}%`;
      case 'light': return `${sensor.value} lux`;
      default: return sensor.value;
    }
  };

  return (
    <div style={{ height: '80vh', width: '100%', position: 'relative', zIndex: 200 }}>
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
          zIndex: 1100
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
                borderLeft: `4px solid ${sensor.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{sensor.name}</div>
                    {sensor.value && (
                      <div style={{ fontSize: '14px' }}>
                        {formatSensorValue(sensor)}
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
          onClick={getCurrentLocation}
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
        {userLocation && fieldBoundary.length > 0 && (
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
            icon={createSensorIcon(sensor.color)}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', borderBottom: `2px solid ${sensor.color}`, paddingBottom: '5px' }}>
                  {sensor.name}
                </h3>
                {sensor.type && (
                  <p style={{ margin: '5px 0' }}>
                    <strong>Type:</strong> {sensor.type}
                  </p>
                )}
                {sensor.value && (
                  <p style={{ margin: '5px 0' }}>
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
        
        {/* Sensor range circles */}
        {sensors.map(sensor => (
          <CircleMarker 
            key={`range-${sensor.id}`}
            center={sensor.position}
            radius={30}
            pathOptions={{ 
              color: sensor.color, 
              fillColor: sensor.color, 
              fillOpacity: 0.1,
              weight: 1 
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default FarmMap;