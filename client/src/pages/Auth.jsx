import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  UserPlus,
  MoveRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function AnimatedSection({ children, className = "" }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const Auth = () => {
  const [activeTab, setActiveTab] = React.useState("login");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen text-white">
      {" "}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to={"/"}
            className="flex items-center space-x-1 cursor-pointer z-50"
          >
            <div className="bg-gradient-to-br dark:from-green-900 dark:to-green-700 rounded-full p-2 mr-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7963/7963920.png"
                alt="icon"
                height={25}
                width={25}
              />
            </div>
            <span className="text-xl font-bold text-white">Krishi Dhaara</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                className="text-black hover:text-green-600 flex items-center bg-white"
              >
                Back to Home <MoveRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      <section className="relative pt-20 flex min-h-screen items-center bg-gradient-to-t from-transparent to-[#003020] justify-center">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="flex flex-col justify-center items-center mx-auto border-1 border-[#414a4a] rounded-lg w-full max-w-md
							bg-white/6 backdrop-blur-lg
						"
            >
              <h2 className="text-2xl font-bold text-white pt-4 pb-2">
                Account Access
              </h2>
              <p className="text-zinc-500 pb-4">
                Enter your credentials to access your plant care system
              </p>
              {/* tabs for login/signup -- use components */}
              <Tabs defaultValue={activeTab} className="mb-8 ">
                <TabsList className="bg-zinc-100 text-slate-400 max-w-full w-60 md:w-96 dark:bg-[#38383c] flex gap-2 ">
                  <TabsTrigger
                    className="cursor-pointer hover:bg-zinc-600 w-full "
                    value="login"
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    className="cursor-pointer hover:bg-zinc-600 w-full"
                    value="signup"
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {activeTab === "login" ? (
                <Login />
              ) : (
                <Signup setActiveTab={setActiveTab} />
              )}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: "",
      });
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/login`,
        {
        email: formData.email,
        password: formData.password,
      },{withCredentials:true});
      // console.log(response.data)
      if (response.data.success===true) {
        
        if (response.data.user && response.data.expiresAt) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("tokenExpiresAt", JSON.stringify(response.data.expiresAt));
        }
        navigate("/dashboard");
      } else {
        setApiError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {apiError && (
        <div className="mx-4 p-2 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm">
          {apiError}
        </div>
      )}

      <form className="w-96" onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <Mail className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="email"
              className="block text-white text-start font-semibold"
            >
              Email
            </label>
          </div>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className="w-full p-2 text-white rounded-sm border-1 border-[#27272a] bg-[#121212]"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <Lock className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="password"
              className="block text-white text-start font-semibold"
            >
              Password
            </label>
          </div>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className="w-full p-2 text-white rounded-sm border-1 border-[#27272a] bg-[#121212]"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div className="p-4 flex gap-2 items-center ">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r dark:from-green-400 dark:via-green-500 dark:to-green-800 text-[#fff] cursor-pointer dark:hover:from-green-200 dark:hover:via-green-300 dark:hover:to-green-400"
          >
            {isLoading ? "Logging in..." : "Login"}
            {!isLoading && <ArrowRight className="h-6 w-6 ml-2" />}
          </Button>
        </div>
        <div className="px-4 py-2 text-end">
          <Link
            to="/forgot-password"
            className="text-zinc-400 hover:text-zinc-300 transition-all duration-150" // Fixed "transitionall" typo
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

const Signup = ({ setActiveTab }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        // "http://localhost:3000/auth/signUp"
        `${BACKEND_URL}/auth/signUp`
        , {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      console.log(response);
      // Show success message
      setSuccessMessage(
        "Account created successfully! Redirecting to login..."
      );

      // Redirect to login tab after a brief delay
      setTimeout(() => {
        setActiveTab("login");
      }, 1500);
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "An error occurred during registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {apiError && (
        <div className="mx-4 p-2 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div className="mx-4 p-2 bg-green-500/20 border border-green-500 rounded text-green-100 text-sm">
          {successMessage}
        </div>
      )}

      <form className="w-96 flex flex-col" onSubmit={handleSubmit}>
        {" "}
        {/* Removed -gap-2 which is invalid */}
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <User className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="fullName"
              className="block text-white text-start font-semibold"
            >
              Full Name
            </label>
          </div>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full p-2 text-white rounded-sm border-1 ${
              errors.fullName ? "border-red-500" : "border-[#27272a]"
            } bg-[#121212]`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <Mail className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="email"
              className="block text-white text-start font-semibold"
            >
              Email
            </label>
          </div>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            className={`w-full p-2 text-white rounded-sm border-1 ${
              errors.email ? "border-red-500" : "border-[#27272a]"
            } bg-[#121212]`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <Lock className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="password"
              className="block text-white text-start font-semibold"
            >
              Password
            </label>
          </div>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            className={`w-full p-2 text-white rounded-sm border-1 ${
              errors.password ? "border-red-500" : "border-[#27272a]"
            } bg-[#121212]`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div className="p-4">
          <div className="flex gap-2 justify-start items-center mb-1">
            <Lock className="h-5 w-5 text-zinc-400" />
            <label
              htmlFor="confirmPassword"
              className="block text-white text-start font-semibold"
            >
              Confirm Password
            </label>
          </div>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            className={`w-full p-2 text-white rounded-sm border-1 ${
              errors.confirmPassword ? "border-red-500" : "border-[#27272a]"
            } bg-[#121212]`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <div className="p-4 flex gap-2 items-center mb-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r dark:from-green-400 dark:via-green-500 dark:to-green-800 text-[#fff] cursor-pointer dark:hover:from-green-200 dark:hover:via-green-300 dark:hover:to-green-400 disabled:opacity-70"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
            {!isLoading && <UserPlus className="h-6 w-6 ml-2" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
