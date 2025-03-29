import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "smartirrigation-1f48f.firebaseapp.com",
    databaseURL: "https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartirrigation-1f48f",
    storageBucket: "smartirrigation-1f48f.firebasestorage.app",
    messagingSenderId: "859711317799",
    appId: "1:859711317799:web:8f9f696e5fe0ecd6766b02",
    measurementId: "G-3N892XERP8"
};

const firebase_secondary_Config = {
    apiKey: import.meta.env.VITE_FIREBASE_SECONDARY_APIKEY,
    authDomain: "smart-irrigation-water-usage.firebaseapp.com",
    databaseURL: "https://smart-irrigation-water-usage-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-irrigation-water-usage",
    storageBucket: "smart-irrigation-water-usage.firebasestorage.app",
    messagingSenderId: "693321324161",
    appId: "1:693321324161:web:0f6e89dcf6ae7ce48d1f80",
    measurementId: "G-SHVFQ9YG04"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const secondaryApp = initializeApp(firebase_secondary_Config, "secondary");
const secondaryDatabase = getDatabase(secondaryApp);

export { database, secondaryDatabase };
