package com.example.smart_irrigation_app.weather.data.api

import com.example.smart_irrigation_app.weather.data.model.WeatherResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface WeatherApiService {
    @GET("forecast.json")
    suspend fun getForecast(
        @Query("key") apiKey: String,
        @Query("q") location: String,
        @Query("days") days: Int = 7,
        @Query("aqi") includeAirQuality: String = "no",
        @Query("alerts") includeAlerts: String = "no"
    ): Response<WeatherResponse>
}