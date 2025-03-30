package com.example.smart_irrigation_app.stats.domain


interface StatsRepository {
    suspend fun fetchPlantHealthHistory(): PlantHealthStats
    suspend fun fetchForecastData(): List<ForecastData>
}


class FetchPlantHealthHistoryUseCase(private val repository: StatsRepository) {
    suspend operator fun invoke(): PlantHealthStats {
        return repository.fetchPlantHealthHistory()
    }
}


class FetchForecastDataUseCase(private val repository: StatsRepository) {
    suspend operator fun invoke(): List<ForecastData> {
        return repository.fetchForecastData()
    }
}