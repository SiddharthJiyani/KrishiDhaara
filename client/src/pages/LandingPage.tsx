"use client";

import { useEffect } from "react";
// import Link from "next/link"
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Droplets,  AlertTriangle,  Thermometer,  Clock,  Leaf,  Brain,  Sun,  BarChart2,  Cloud,  Layout,  ChevronDown,  ArrowRight,} from "lucide-react";
import { Button } from "../components/ui/button";
import React from "react";
import { Link } from "react-router-dom";

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

const problems = [
  {
    icon: <Droplets className="h-5 w-5" />,
    title: "Problem",
    description:
      "Inconsistent watering leads to over or under-watered plants, causing stress and potential death",
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Problem",
    description:
      "Difficulty in identifying plant diseases early, resulting in widespread damage before detection",
  },
  {
    icon: <Thermometer className="h-5 w-5" />,
    title: "Problem",
    description:
      "Lack of real-time environmental data makes it challenging to create optimal growing conditions",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Problem",
    description:
      "Time-consuming manual monitoring and maintenance processes that are prone to human error",
  },
];

const solutions = [
  {
    icon: <Droplets className="h-5 w-5 text-blue-400" />,
    title: "Solution",
    description:
      "Smart irrigation system that monitors soil moisture in real-time and waters plants precisely when needed",
  },
  {
    icon: <Leaf className="h-5 w-5 text-green-400" />,
    title: "Solution",
    description:
      "AI-powered disease detection that identifies plant health issues at the earliest stages through image analysis",
  },
  {
    icon: <Sun className="h-5 w-5 text-yellow-400" />,
    title: "Solution",
    description:
      "Environmental monitoring with sensors that track temperature, humidity, and light conditions for optimal plant growth",
  },
  {
    icon: <Brain className="h-5 w-5 text-purple-400" />,
    title: "Solution",
    description:
      "Automated care system that reduces manual intervention while improving plant health through data-driven decisions",
  },
];

const features = [
  {
    icon: <Droplets className="h-6 w-6" />,
    title: "Real-time Moisture Monitoring",
    description:
      "Continuous tracking of soil moisture levels with precise sensors that ensure optimal watering conditions.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Disease Detection",
    description:
      "Advanced image recognition technology that identifies plant diseases with high accuracy.",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Comprehensive Disease Library",
    description:
      "Extensive database of plant diseases with detailed information and treatment recommendations.",
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Data Visualization",
    description:
      "Interactive charts and graphs that make complex plant data easy to understand and act upon.",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Weather Integration",
    description:
      "Local weather forecasting that helps optimize irrigation schedules based on upcoming conditions.",
  },
  {
    icon: <Layout className="h-6 w-6" />,
    title: "Responsive Design",
    description:
      "Access your plant care system from any device with a fully responsive interface that works everywhere.",
  },
];

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
      className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="min-h-screen bg-[] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
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
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button
                variant="ghost"
                className="text-white hover:text-green-600">
                Dashboard
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center bg-gradient-to-t from-transparent to-[#003020] justify-center">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection className="space-y-6">
            <motion.div variants={fadeIn} className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br dark:from-green-900 dark:to-green-700">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/7963/7963920.png"
                  alt="icon"
                  height={35}
                  width={35}
                />
              </div>
            </motion.div>
            <motion.h1
              variants={fadeIn}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-green-500 to-green-800 sm:text-6xl">
              Krishi Dhaara
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="mx-auto max-w-2xl text-lg text-gray-400">
              The intelligent solution for modern plant care, powered by IoT and
              AI technology
            </motion.p>
            <motion.div variants={fadeIn} className="flex justify-center gap-4">
              <Link to="/dashboard">
                <Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90 cursor-pointer">
                  Explore Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-[#00FF9D] text-green-600 hover:bg-[#00FF9D]/10 cursor-pointer"
                onClick={() =>
                  window.scrollBy({ top: 650, behavior: "smooth" })
                }>
                Learn More <ChevronDown className="h-4 w-4 ml-1 " />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute mt-10 left-1/2 -translate-x-1/2">
              <ChevronDown
                className="h-8 w-8 animate-bounce text-green-600 cursor-pointer"
                onClick={() => {
                  window.scrollBy({ top: 650, behavior: "smooth" });
                }}
              />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="space-y-12">
            <div className="text-center">
              <motion.h2
                variants={fadeIn}
                className="text-3xl font-bold sm:text-4xl">
                The Challenges of Modern Plant Care
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-gray-400">
                Plant owners face numerous obstacles that can lead to unhealthy
                plants and wasted resources
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-[#00FF9D]/50">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-white/10 p-2 text-green-600">
                      {problem.icon}
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-green-600">
                        {problem.title}
                      </h3>
                      <p className="text-gray-400">{problem.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="space-y-12">
            <div className="text-center">
              <motion.h2
                variants={fadeIn}
                className="text-3xl font-bold sm:text-4xl">
                Introducing <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-500 to-green-700">Krishi Dhaara</span>
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-gray-400">
                A comprehensive solution that transforms plant care through
                intelligent technology
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-[#00FF9D]/50">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-white/10 p-2">
                      {solution.icon}
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-green-600">
                        {solution.title}
                      </h3>
                      <p className="text-gray-400">{solution.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="space-y-12">
            <div className="text-center">
              <motion.h2
                variants={fadeIn}
                className="text-3xl font-bold sm:text-4xl">
                Key Features
              </motion.h2>
              <motion.p variants={fadeIn} className="mt-4 text-gray-400">
                Discover how Krishi Dhaara revolutionizes plant care with these
                powerful capabilities
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="group rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#00FF9D]/50 hover:bg-white/10">
                  <div className="mb-4 rounded-full bg-white/10 p-3 text-green-600 transition-colors group-hover:bg-[#00FF9D]/10">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-green-600">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#003020]" />
        <div className="container relative mx-auto px-4">
          <AnimatedSection className="text-center">
            <motion.h2
              variants={fadeIn}
              className="text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Plant Care?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mx-auto mt-4 max-w-2xl text-gray-400">
              Experience the future of intelligent plant management with
              Krishi Dhaara&apos;s comprehensive solution
            </motion.p>
            <motion.div variants={fadeIn} className="mt-8">
              <Link to="/dashboard">
                <Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90">
                  Explore the Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
