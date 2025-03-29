import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/Header.jsx";
import ModelDetails from "../components/DiseaseDetection/ModelDetails.jsx";
import ImageUpload from "../components/DiseaseDetection/ImageUpload.jsx";
import PredictionResult from "../components/DiseaseDetection/PredictionResult.jsx";
import DiseaseLibrary from "../components/DiseaseDetection/DiseaseLibrary.jsx";
import CropRecommendationForm from "../components/DiseaseDetection/CropRecommendationForm.jsx";
import { ArrowLeft, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"; // Import Tabs components
import "../i18n";

export default function PredictDisease() {
  // Use the default namespace or specify one if needed
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  const [predictedDisease, setPredictedDisease] = useState("");
  const [cure, setCure] = useState("");
  const [activeTab, setActiveTab] = useState("disease"); // State to track active tab

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
      className="min-h-screen bg-black text-zinc-100 transition-colors duration-300">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 cursor-pointer text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
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
          <p className="text-zinc-400">
            {t("diseasePage.subtitle")}
          </p>
        </motion.div>

        {/* Tabs Component */}
        <Tabs 
          defaultValue="disease" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="bg-zinc-100 text-slate-400 dark:bg-[#27272a]">
            <TabsTrigger 
              value="disease" 
              className="cursor-pointer hover:bg-zinc-600"
            >
              {t("diseasePage.tabs.plantDisease")}
            </TabsTrigger>
            <TabsTrigger 
              value="recommendation" 
              className="cursor-pointer hover:bg-zinc-600"
            >
              {t("diseasePage.tabs.cropRecommendation")}
            </TabsTrigger>
          </TabsList>

          {/* Plant Disease Detection Tab Content */}
          <TabsContent value="disease" className="mt-0">
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
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}>
                <DiseaseLibrary />
              </motion.div>
            </div>
          </TabsContent>

          {/* Crop Recommendation Tab Content */}
          <TabsContent value="recommendation" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2">
                <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-green-500 mb-4">
                    {t("diseasePage.cropRecommendation.title")}
                  </h2>
                  <p className="text-zinc-300 mb-4">
                    {t("diseasePage.cropRecommendation.description")}
                  </p>
                </div>
                <CropRecommendationForm />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-zinc-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-500 mb-4">
                  {t("diseasePage.cropRecommendation.tips.title")}
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-600 p-1 mr-3 mt-1">
                      <span className="text-xs font-bold">1</span>
                    </span>
                    <p className="text-zinc-300">{t("diseasePage.cropRecommendation.tips.tip1")}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-600 p-1 mr-3 mt-1">
                      <span className="text-xs font-bold">2</span>
                    </span>
                    <p className="text-zinc-300">{t("diseasePage.cropRecommendation.tips.tip2")}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-600 p-1 mr-3 mt-1">
                      <span className="text-xs font-bold">3</span>
                    </span>
                    <p className="text-zinc-300">{t("diseasePage.cropRecommendation.tips.tip3")}</p>
                  </li>
                </ul>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}