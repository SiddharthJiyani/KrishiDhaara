import React from "react";
import { motion } from "framer-motion";

const WeatherDayCard = ({ day, isSelected, onClick, renderWeatherIcon }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className={`p-4 rounded-lg shadow-lg transition-all duration-300 cursor-pointer ${
      isSelected
        ? "bg-zinc-800 transform scale-105 ring-2 ring-blue-400"
        : "bg-[#1d1d21] hover:bg-zinc-700/80"
    }`}
    onClick={onClick}>
    <div className="text-center">
      <p className="font-medium">{day.day}</p>
      <p className="text-sm text-gray-300">{day.date}</p>
      <div className="h-10 w-10 mx-auto my-2">
        {renderWeatherIcon(day.icon)}
      </div>
      <p className="text-lg font-bold">{day.temp}</p>
      <p className="text-xs text-gray-300">
        {day.low}° / {day.high}°
      </p>
    </div>
  </motion.div>
);

export default WeatherDayCard;
