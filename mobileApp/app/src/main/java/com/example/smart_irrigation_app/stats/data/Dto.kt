package com.example.smart_irrigation_app.stats.data

data class PlantHealthResponseDto(
    val success: Boolean,
    val message: PlantHealthStatsDto
)

data class PlantHealthStatsDto(
    val healthy_count: Int?,
    val unhealthy_count: Int?,
    val total_count: Int?
)

data class ForecastResponseDto(
    val forecast: List<ForecastDto>
)

data class ForecastDto(
    val humidity: Double,
    val temperature: Double,
    val timestamp: String
)