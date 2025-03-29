import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Footer from "./components/Footer";


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

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isLandingPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      {/* <Chatbot /> */}
    </Router>
  );
}

export default App;
