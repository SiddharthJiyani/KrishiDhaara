package com.example.smart_irrigation_app.weather.domain.repository

import com.example.smart_irrigation_app.weather.domain.model.WeatherForecast


interface WeatherRepository {
    suspend fun getWeatherForecast(locationQuery: String): Result<WeatherForecast>
}