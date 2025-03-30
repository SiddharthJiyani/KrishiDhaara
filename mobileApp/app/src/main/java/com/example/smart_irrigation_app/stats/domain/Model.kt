package com.example.smart_irrigation_app.stats.domain

data class MonthlyData(
    val month: String,
    val value: Int
)

data class HealthData(
    val label: String,
    val value: Double,
    val color: String
)

data class ForecastData(
    val humidity: Double,
    val temperature: Double,
    val timestamp: String
)

data class PlantHealthStats(
    val healthyCount: Int,
    val unhealthyCount: Int,
    val totalCount: Int
)

data class SensorData(
    val day: String,
    val soilMoisture: Int,
    val temperature: Int,
    val humidity: Int
)