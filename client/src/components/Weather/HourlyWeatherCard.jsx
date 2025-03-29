import React from "react";
import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";

const HourlyWeatherCard = ({ hour, renderWeatherIcon }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="bg-zinc-800 p-4 rounded-lg text-center">
    <p className="font-medium">{hour.time}</p>
    <div className="h-8 w-8 mx-auto my-2">{renderWeatherIcon(hour.icon)}</div>
    <p className="text-lg font-bold">{hour.temp}°C</p>
    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
      <div className="flex items-center justify-center">
        <Droplets className="h-4 w-4 text-blue-400 mr-1" />
        <span>{hour.humidity}%</span>
      </div>
      <div className="flex items-center justify-center">
        <Wind className="h-4 w-4 text-blue-400 mr-1" />
        <span>{hour.wind} km/h</span>
      </div>
    </div>
  </motion.div>
);

export default HourlyWeatherCard;
