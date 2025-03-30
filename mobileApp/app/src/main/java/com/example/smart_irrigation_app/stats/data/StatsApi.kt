package com.example.smart_irrigation_app.stats.data

import retrofit2.http.GET

interface StatsApi {
    @GET("PlantPrediction/getDiseaseStats")
    suspend fun getPlantHealthStats(): PlantHealthResponseDto

    @GET("forecast")
    suspend fun getForecastData(): ForecastResponseDto
}