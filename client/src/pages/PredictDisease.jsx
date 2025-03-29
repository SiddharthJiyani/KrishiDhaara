import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/Header.jsx";
import ModelDetails from "../components/DiseaseDetection/ModelDetails.jsx";
import ImageUpload from "../components/DiseaseDetection/ImageUpload.jsx";
import PredictionResult from "../components/DiseaseDetection/PredictionResult.jsx";
import DiseaseLibrary from "../components/DiseaseDetection/DiseaseLibrary.jsx";
import CropRecommendationForm from "../components/DiseaseDetection/CropRecommendationForm.jsx";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import "../i18n";

export default function PredictDisease() {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  const [predictedDisease, setPredictedDisease] = useState("");
  const [cure, setCure] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  
  // Toggle language function
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Apply dark mode class to the document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-gray-100 transition-colors duration-300">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
              <span>{t("diseasePage.backToDashboard")}</span>
            </a>
          </motion.div>
          
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            {t("diseasePage.title")}
          </h1>
          <p className="text-gray-400">
            {t("diseasePage.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2">
            <ModelDetails />
            <ImageUpload onPrediction={setPredictedDisease} onCure={setCure} />
            {predictedDisease && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}>
                <PredictionResult
                  predictedDisease={predictedDisease}
                  cure={cure}
                />
              </motion.div>
            )}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}>
                <CropRecommendationForm />
              </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <DiseaseLibrary />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}