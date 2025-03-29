import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { database } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const previousStatesRef = useRef({});
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
  }, []);

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
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <button
            className="text-gray-400 rounded-lg p-2 hover:text-white hover:bg-[#28282f] cursor-pointer"
            onClick={handleMarkAllAsRead}>
            Mark as read
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
                            "warning"
                          )}`}></span>
                        <span className="font-medium text-white">
                          {notification.sensorNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400">{`Our AI suggests flipping this relay ${notification.state} for optimal performance! 🚀`}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
}