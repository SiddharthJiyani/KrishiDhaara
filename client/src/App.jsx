import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import WeatherPage from "./pages/WeatherPage";
import StatsPage from "./pages/StatsPage";
import PredictDisease from "./pages/PredictDisease";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import CareTips from "./pages/CareTips";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import ProtectedRoute from "./lib/ProtectedRoute";
import NewsPage from "./pages/News";
import Chatbot from "./components/Chatbot";
import AgriReport from "./components/AgriReport";

function AppContent() {
  const location = useLocation();
  const activeTab = location.pathname;

  const isLandingPage = activeTab === "/";
  const isAuthPage = activeTab === "/auth";

  return (
    <div className="bg-black">
      {!isLandingPage && !isAuthPage && <Header activeTab={activeTab} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/report" element={<AgriReport />} />
        <Route element={<ProtectedRoute></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/predict-disease" element={<PredictDisease />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/care-tips" element={<CareTips />} />
        </Route>
      </Routes>
      {!isLandingPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Chatbot />
    </Router>
  );
}

export default App;
