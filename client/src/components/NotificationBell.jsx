import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { database, secondaryDatabase } from "../lib/firebase";
import { ref, onValue } from "firebase/database";
import "../i18n";

export default function NotificationBell() {
  const { t } = useTranslation('notifications');
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const previousStatesRef = useRef({});
  const previousAnomalyRef = useRef({});
  const modalRef = useRef(null);
  const unreadCount = notifications.length;

  const handleMarkAllAsRead = () => {
    setNotifications([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const dbRef = ref(database, "/relay-sensors-suggestion");
    const secdbRef = ref(secondaryDatabase,"/anomaly");

    onValue(secdbRef, (snapshot) => {
      if (snapshot.exists()) {
        const anomalyData = snapshot.val();
        console.log(anomalyData)
        const newNotifications = [];
        
        // Check for soil moisture anomaly
        if (anomalyData.soil_moisture !== undefined && 
            previousAnomalyRef.current.soil_moisture !== anomalyData.soil_moisture) {
          if (anomalyData.soil_moisture) {
            newNotifications.push({
              id: "soil_moisture_" + Date.now(),
              sensorNumber: t("notifications.anomalies.soilMoisture.title"),
              state: "alert",
              type: "error",
              timestamp: new Date().toISOString(),
              message: t("notifications.anomalies.soilMoisture.message")
            });
          }
          previousAnomalyRef.current.soil_moisture = anomalyData.soil_moisture;
        }
        
        // Check for temperature anomaly
        if (anomalyData.temperature !== undefined && 
            previousAnomalyRef.current.temperature !== anomalyData.temperature) {
          if (anomalyData.temperature) {
            newNotifications.push({
              id: "temperature_" + Date.now(),
              sensorNumber: t("notifications.anomalies.temperature.title"),
              state: "alert",
              type: "error",
              timestamp: new Date().toISOString(),
              message: t("notifications.anomalies.temperature.message")
            });
          }
          previousAnomalyRef.current.temperature = anomalyData.temperature;
        }
        
        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev]);
        }
      }
    });

    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newNotifications = [];
        Object.entries(data).forEach(([device, deviceData]) => {
          const currentState = deviceData.state;
          const previousState = previousStatesRef.current[device];
          
          if (previousState === undefined || previousState !== currentState) {
            let timestamp;
            
            // For initial state or when page is first loaded
            if (previousState === undefined) {
              // Generate random minutes between 5-10
              const minutesToSubtract = Math.floor(Math.random() * 6) + 5; // 5-10 minutes
              const pastTime = new Date();
              pastTime.setMinutes(pastTime.getMinutes() - minutesToSubtract);
              timestamp = pastTime.toISOString();
            } else {
              // For state changes after tracking has begun
              timestamp = new Date().toISOString();
            }
            
            newNotifications.push({
              id: device + Date.now(),
              sensorNumber: device,
              state: currentState,
              timestamp: timestamp,
            });
            previousStatesRef.current[device] = currentState;
          }
        });
        if (newNotifications.length > 0) {
          setNotifications((prev) => [...newNotifications, ...prev]);
        }
      }
    });
  }, [t]);

  const getNotificationColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "success":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  // Format notification message based on whether it's a system message or relay notification
  const getNotificationMessage = (notification) => {
    if (notification.message) {
      return notification.message;
    } else {
      return t("notifications.relayMessage", { state: notification.state });
    }
  };

  // Format timestamp with the current locale
  const formatTimestamp = (timestamp) => {
    //  i dont want seconds in the timestamp
    const date = new Date(timestamp);
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
    const formattedDate = date.toLocaleString(undefined, options);
    const [datePart, timePart] = formattedDate.split(", ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute] = timePart.split(":");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <div
        ref={modalRef}
        className={`absolute right-0 top-14 z-50 w-80 rounded-md border border-gray-800 bg-[#121215] shadow-lg transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "-translate-y-2 opacity-0 scale-95 pointer-events-none"
        }`}>
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <h3 className="text-lg font-semibold text-white">{t("notifications.title")}</h3>
          <button
            className="text-gray-400 rounded-lg p-2 hover:text-white hover:bg-[#28282f] cursor-pointer"
            onClick={handleMarkAllAsRead}>
            {t("notifications.markAsRead")}
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-800 p-4 hover:bg-[#28282f]">
                  <div className="mb-2 flex items-center justify-between">
                    <div
                      className="grid 
                      grid-cols-2 gap-6
                    ">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${getNotificationColor(
                            notification.message? "error":"warning"
                          )}`}></span>
                        <span className="font-medium text-white">
                          {notification.sensorNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400">{getNotificationMessage(notification)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              {t("notifications.noNotifications")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}