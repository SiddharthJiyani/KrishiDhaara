import React, { useState, useEffect, act } from "react";
import { Button } from "../components/ui/button";
import {
  Leaf,
  Home,
  Cloud,
  ShieldPlus ,
  BookOpen,
  BarChart2,
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  LogOut,
  Newspaper,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useCookies } from "react-cookie";
import '../i18n';
import LanguageToggle from "./LanguageToggle";
// import  NotificationBell  from "./NotificationBell";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Header({ darkMode, toggleDarkMode, activeTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on initial render
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    const response = await axios.delete(
      // "http://localhost:3000/auth/logout"
      `${BACKEND_URL}/auth/logout`
      , {
      withCredentials: true,
    });
    if (response.data.success) {
      localStorage.setItem("user", "");
      localStorage.setItem("tokenExpiresAt", "");
      removeCookie("token", { path: "/", sameSite: "lax" });
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-1 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            to={"/"}
            className="flex items-center space-x-1 cursor-pointer z-50">
            <div className="bg-gradient-to-br dark:from-green-900 dark:to-green-700 rounded-full p-2 mr-2">
              {/* <Leaf className="h-5 w-5 text-green-100" /> */}
              <img
                src="https://cdn-icons-png.flaticon.com/512/7963/7963920.png"
                alt="icon"
                height={25}
                width={25}
              />
            </div>
            <span className="text-xl font-bold text-white">Krishi Dhaara</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex justify-between items-center space-x-1">
            <NavItem
              icon={<Home size={18} />}
              label="Dashboard"
              to="/dashboard"
              active={activeTab === "/dashboard"}
            />
            <NavItem
              icon={<Cloud size={18} />}
              label="Weather"
              to="/weather"
              active={activeTab === "/weather"}
            />
            <NavItem
              icon={<ShieldPlus  size={18} />}
              label="Plant Health"
              to="/predict-disease"
              active={activeTab === "/predict-disease"}
            />
            <NavItem
              icon={<Newspaper size={18} />}
              label="News"
              to="/news"
              active={activeTab === "/news"}
            />
            <NavItem
              icon={<BookOpen size={18} />}
              label="Care Tips"
              to="/care-tips"
              active={activeTab === "/care-tips"}
            />
            <NavItem
              icon={<BarChart2 size={18} />}
              label="Stats"
              to="/stats"
              active={activeTab === "/stats"}
            />
            {/* <NavItem
              icon={<LogIn size={18} />}
              label="Login"
              to="/auth"
              active={activeTab === "/auth"}
            /> */}
            {/* <NotificationBell /> */}
            <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <button
                onClick={handleLogout}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:bg-gray-800 cursor-pointer hover:text-white `}>
                <span className="mr-2">
                  <LogOut />
                </span>
                Logout
              </button>
            </div>

            <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors">
              <button
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-400 hover:bg-gray-800 cursor-pointer hover:text-white `}>
                <span className="mr-2">
                  <LanguageToggle />
                </span>
              </button>
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              {/* <NotificationBell /> */}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-40 md:hidden ">
            <div className="flex flex-col items-center justify-center min-h-screen h-full pt-40 sm:pt-64 pb-10 px-6 overflow-y-auto bg-black backdrop-blur-xl">
              <motion.nav
                className="flex flex-col items-center space-y-6 py-8 w-full max-w-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}>
                <MobileNavItem
                  icon={<Home size={24} />}
                  label="Dashboard"
                  to="/dashboard"
                  active={activeTab === "/dashboard"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.1}
                />
                <MobileNavItem
                  icon={<Cloud size={24} />}
                  label="Weather"
                  to="/weather"
                  active={activeTab === "/weather"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.2}
                />
                <MobileNavItem
                  icon={<ShieldPlus  size={24} />}
                  label="Plant Health"
                  to="/predict-disease"
                  active={activeTab === "/predict-disease"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.3}
                />
                <MobileNavItem
                  icon={<Newspaper size={24} />}
                  label="News"
                  to="/news"
                  active={activeTab === "/news"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.4}
                />
                <MobileNavItem
                  icon={<BookOpen size={24} />}
                  label="Care Tips"
                  active={false}
                  to={"/care-tips"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.5}
                />
                <MobileNavItem
                  icon={<BarChart2 size={24} />}
                  label="Stats"
                  to="/stats"
                  active={activeTab === "/stats"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.6}
                />
                <MobileNavItem
                  icon={<LogOut size={24} />}
                  label="Logout"
                  to="/auth"
                  active={activeTab === "/auth"}
                  onClick={() => setIsMenuOpen(false)}
                  delay={0.7}
                />
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavItem({ icon, label, active, to }) {
  return (
    <Link
      to={to || "#"}
      className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors">
      <button
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-green-500/10 text-green-400"
            : "text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        }`}>
        <span className="mr-2">{icon}</span>
        {label}
      </button>
    </Link>
  );
}

function MobileNavItem({ icon, label, active, to, onClick, delay }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: delay }}
      className="w-full flex justify-center">
      <Link to={to || "#"} className="w-full max-w-xs" onClick={onClick}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          // Applying a glass green clip effect using a clip-path
          // style={{
          //   clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 85%)",
          //   backgroundColor: "rgba(0, 0, 0, 0.6)", // optional background color for the tab
          //   borderRadius: "10px", // optional: soft rounded corners for the navbar
          // }}

          style={{
            background:
              "linear-gradient(135deg, rgba(0, 50, 0, 0.9), rgba(34, 80, 34, 0.8))", // Deep green gradient
            clipPath:
              "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)", // Geometric, sharp edges
            borderRadius: "10px", // Slight rounded corners for balance
            backdropFilter: "blur(5px)", // Light glassmorphism effect
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", // Strong shadow for depth
          }}
          className={`flex items-center justify-center flex-col w-full py-5 rounded-xl backdrop-blur-md transition-all duration-300 ${
            active
              ? "!bg-white text-green-400 border border-green-500/15"
              : "bg-green-900/30 text-green-300 hover:text-white hover:bg-green-800/70 border border-green-800/50 hover:border-green-700"
          }`}>
          <motion.div className="mb-2" whileHover={{ y: -2 }}>
            {icon}
          </motion.div>
          <span className="text-base font-medium">{label}</span>
        </motion.button>
      </Link>
    </motion.div>
  );
}
