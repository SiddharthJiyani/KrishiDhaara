import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import WeatherPage from "./pages/WeatherPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PredictDisease from "./pages/PredictDisease";
import ProtectedRoute from "./lib/ProtectedRoute";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";


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

        <Route element={<ProtectedRoute></ProtectedRoute>}>
        <Route path="/predict-disease" element={<PredictDisease />} />
        <Route path="/weather" element={<WeatherPage />} />
        
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
    </Router>
  );
}

export default App;
