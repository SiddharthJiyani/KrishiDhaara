import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: "smartirrigation-1f48f.firebaseapp.com",
    databaseURL: "https://smartirrigation-1f48f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartirrigation-1f48f",
    storageBucket: "smartirrigation-1f48f.firebasestorage.app",
    messagingSenderId: "859711317799",
    appId: "1:859711317799:web:8f9f696e5fe0ecd6766b02",
    measurementId: "G-3N892XERP8"
};

const app = initializeApp(firebaseConfig);
export const firebase_db = getDatabase(app);
