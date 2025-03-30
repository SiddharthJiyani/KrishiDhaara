package com.example.smart_irrigation_app.weather.domain.model

data class WeatherForecast(
    val location: Location,
    val current: CurrentWeather,
    val dailyForecasts: List<DailyForecast>
)

data class Location(
    val name: String,
    val region: String,
    val country: String,
    val latitude: Double,
    val longitude: Double,
    val localTime: String
)

data class CurrentWeather(
    val temperature: Float,
    val condition: WeatherCondition,
    val windSpeed: Float,
    val humidity: Int,
    val feelsLike: Float,
    val uvIndex: Float
)

data class WeatherCondition(
    val description: String,
    val iconUrl: String,
    val code: Int
)

data class DailyForecast(
    val date: String,
    val maxTemp: Float,
    val minTemp: Float,
    val avgTemp: Float,
    val condition: WeatherCondition,
    val maxWindSpeed: Float,
    val precipitation: Float,
    val sunrise: String,
    val sunset: String,
    val hourlyForecasts: List<HourlyForecast>
)

data class HourlyForecast(
    val time: String,
    val hour: Int,
    val temperature: Float,
    val condition: WeatherCondition,
    val windSpeed: Float,
    val humidity: Int,
    val feelsLike: Float,
    val chanceOfRain: Int
)