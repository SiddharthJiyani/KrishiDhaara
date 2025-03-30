package com.example.smart_irrigation_app.weather.domain.usecase

import com.example.smart_irrigation_app.weather.domain.model.WeatherForecast
import com.example.smart_irrigation_app.weather.domain.repository.WeatherRepository


class GetWeatherForecastUseCase(private val weatherRepository: WeatherRepository) {

    suspend operator fun invoke(location: String): Result<WeatherForecast> {
        return weatherRepository.getWeatherForecast(location)
    }

    // Optional: Overloaded version that takes latitude and longitude
    suspend operator fun invoke(latitude: Double, longitude: Double): Result<WeatherForecast> {
        val locationQuery = "$latitude,$longitude"
        return weatherRepository.getWeatherForecast(locationQuery)
    }
}