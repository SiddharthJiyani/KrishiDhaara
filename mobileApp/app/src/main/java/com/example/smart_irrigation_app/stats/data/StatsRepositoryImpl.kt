package com.example.smart_irrigation_app.stats.data

import com.example.smart_irrigation_app.stats.domain.ForecastData
import com.example.smart_irrigation_app.stats.domain.PlantHealthStats
import com.example.smart_irrigation_app.stats.domain.StatsRepository


class StatsRepositoryImpl(
    private val statsApi: StatsApi
) : StatsRepository {

    override suspend fun fetchPlantHealthHistory(): PlantHealthStats {
        val response = statsApi.getPlantHealthStats()

        if (response.success) {
            return with(response.message) {
                PlantHealthStats(
                    healthyCount = healthy_count ?: 0,
                    unhealthyCount = unhealthy_count ?: 0,
                    totalCount = total_count ?: 0
                )
            }
        } else {
            throw Exception("Failed to fetch plant health stats")
        }
    }

    override suspend fun fetchForecastData(): List<ForecastData> {
        val response = statsApi.getForecastData()

        return response.forecast.map { forecastDto ->
            ForecastData(
                humidity = forecastDto.humidity,
                temperature = forecastDto.temperature,
                timestamp = forecastDto.timestamp
            )
        }
    }
}
