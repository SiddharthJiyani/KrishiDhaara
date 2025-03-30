"use client";

import { useEffect } from "react";
// import Link from "next/link"
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
	Droplets,
	AlertTriangle,
	Thermometer,
	Clock,
	Leaf,
	Brain,
	Sun,
	BarChart2,
	Cloud,
	Layout,
	ChevronDown,
	ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../i18n";
import useAuth from "../lib/useAuth";

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
			className={className}>
			{children}
		</motion.div>
	);
}

export default function LandingPage() {
	const { t } = useTranslation();

	const problems = [
		{
			icon: <Droplets className="h-5 w-5" />,
			title: t(`h4`),
			description: t("c1"),
		},
		{
			icon: <AlertTriangle className="h-5 w-5" />,
			title: t("h4"),
			description: t("c2"),
		},
		{
			icon: <Thermometer className="h-5 w-5" />,
			title: t("h4"),
			description: t("c3"),
		},
		{
			icon: <Clock className="h-5 w-5" />,
			title: t("h4"),
			description: t("c4"),
		},
	];

	const solutions = [
		{
			icon: <Droplets className="h-5 w-5 text-blue-400" />,
			title: t("h7"),
			description: t("c5"),
		},
		{
			icon: <Leaf className="h-5 w-5 text-green-400" />,
			title: t("h7"),
			description: t("c6"),
		},
		{
			icon: <Sun className="h-5 w-5 text-yellow-400" />,
			title: t("h7"),
			description: t("c7"),
		},
		{
			icon: <Brain className="h-5 w-5 text-purple-400" />,
			title: t("h7"),
			description: t("c8"),
		},
	];

	const features = [
		{
			icon: <Droplets className="h-6 w-6" />,
			title: t("realTimeMoistureMonitoringTitle"),
			description: t("realTimeMoistureMonitoringDesc"),
		},
		{
			icon: <Brain className="h-6 w-6" />,
			title: t("aiDiseaseDetectionTitle"),
			description: t("aiDiseaseDetectionDesc"),
		},
		{
			icon: <Leaf className="h-6 w-6" />,
			title: t("comprehensiveDiseaseLibraryTitle"),
			description: t("comprehensiveDiseaseLibraryDesc"),
		},
		{
			icon: <BarChart2 className="h-6 w-6" />,
			title: t("dataVisualizationTitle"),
			description: t("dataVisualizationDesc"),
		},
		{
			icon: <Cloud className="h-6 w-6" />,
			title: t("weatherIntegrationTitle"),
			description: t("weatherIntegrationDesc"),
		},
		{
			icon: <Layout className="h-6 w-6" />,
			title: t("responsiveDesignTitle"),
			description: t("responsiveDesignDesc"),
		},
	];

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const isAuthenticated = useAuth();

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
						<span className="text-xl font-bold text-white">{t("header")}</span>
					</Link>
					<div className="flex items-center gap-4">
						<Link to="/dashboard">
							<Button
								variant="ghost"
								className="text-white hover:text-green-600">
								{t("dsh")}
							</Button>
						</Link>
						<Link to="/auth">
							{!isAuthenticated && <Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90">
								{t("signin")}
							</Button>}
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
							{t("header")}
						</motion.h1>
						<motion.p
							variants={fadeIn}
							className="mx-auto max-w-2xl text-lg text-gray-400">
							{t("h1")}
						</motion.p>
						<motion.div variants={fadeIn} className="flex justify-center gap-4">
							<Link to="/dashboard">
								<Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90 cursor-pointer">
									{t("button1")}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
							<Button
								variant="outline"
								className="border-[#00FF9D] text-green-600 hover:bg-[#00FF9D]/10 cursor-pointer"
								onClick={() =>
									window.scrollBy({ top: 650, behavior: "smooth" })
								}>
								{t("button2")} <ChevronDown className="h-4 w-4 ml-1 " />
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
								{t("h2")}
							</motion.h2>
							<motion.p variants={fadeIn} className="mt-4 text-gray-400">
								{t("h3")}
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
								Introducing{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-500 to-green-700">
									{t("header")}
								</span>
							</motion.h2>
							<motion.p variants={fadeIn} className="mt-4 text-gray-400">
								{t("h6")}
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
								{t("h8")}
							</motion.h2>
							<motion.p variants={fadeIn} className="mt-4 text-gray-400">
								{t("h9")}
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
							{t("h10")}
						</motion.h2>
						<motion.p
							variants={fadeIn}
							className="mx-auto mt-4 max-w-2xl text-gray-400">
							{t("h11")}
							{/* Experience the future of intelligent plant management with
              Krishi Dhaara&apos;s comprehensive solution */}
						</motion.p>
						<motion.div variants={fadeIn} className="mt-8">
							<Link to="/dashboard">
								<Button className="bg-[#00FF9D] text-[#001810] hover:bg-[#00FF9D]/90">
									{t("button1")}
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
