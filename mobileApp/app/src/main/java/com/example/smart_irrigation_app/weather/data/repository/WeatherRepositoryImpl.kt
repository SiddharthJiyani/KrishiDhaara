package com.example.smart_irrigation_app.weather.data.repository

import com.example.smart_irrigation_app.weather.data.api.WeatherApiClient
import com.example.smart_irrigation_app.weather.data.model.WeatherResponse
import com.example.smart_irrigation_app.weather.domain.model.CurrentWeather
import com.example.smart_irrigation_app.weather.domain.model.DailyForecast
import com.example.smart_irrigation_app.weather.domain.model.HourlyForecast
import com.example.smart_irrigation_app.weather.domain.model.Location
import com.example.smart_irrigation_app.weather.domain.model.WeatherCondition
import com.example.smart_irrigation_app.weather.domain.model.WeatherForecast
import com.example.smart_irrigation_app.weather.domain.repository.WeatherRepository
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class WeatherRepositoryImpl : WeatherRepository {

    private val apiService = WeatherApiClient.service
    private val apiKey = WeatherApiClient.getApiKey()

    override suspend fun getWeatherForecast(locationQuery: String): Result<WeatherForecast> {
        return try {
            val response = apiService.getForecast(apiKey, locationQuery)
            if (response.isSuccessful) {
                response.body()?.let { weatherResponse ->
                    Result.success(mapToWeatherForecast(weatherResponse))
                } ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception("API error: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun mapToWeatherForecast(response: WeatherResponse): WeatherForecast {
        val location = Location(
            name = response.location.name,
            region = response.location.region,
            country = response.location.country,
            latitude = response.location.latitude,
            longitude = response.location.longitude,
            localTime = response.location.localTime
        )

        val current = CurrentWeather(
            temperature = response.current.temperatureCelsius,
            condition = WeatherCondition(
                description = response.current.condition.text,
                iconUrl = response.current.condition.iconUrl,
                code = response.current.condition.code
            ),
            windSpeed = response.current.windKph,
            humidity = response.current.humidity,
            feelsLike = response.current.feelsLikeCelsius,
            uvIndex = response.current.uvIndex
        )

        val dailyForecasts = response.forecast.forecastDays.map { forecastDay ->
            DailyForecast(
                date = forecastDay.date,
                maxTemp = forecastDay.day.maxTempCelsius,
                minTemp = forecastDay.day.minTempCelsius,
                avgTemp = forecastDay.day.avgTempCelsius,
                condition = WeatherCondition(
                    description = forecastDay.day.condition.text,
                    iconUrl = forecastDay.day.condition.iconUrl,
                    code = forecastDay.day.condition.code
                ),
                maxWindSpeed = forecastDay.day.maxWindKph,
                precipitation = forecastDay.day.totalPrecipMm,
                sunrise = forecastDay.astro.sunrise,
                sunset = forecastDay.astro.sunset,
                hourlyForecasts = forecastDay.hours.map { hour ->
                    HourlyForecast(
                        time = hour.time,
                        hour = parseHourFromTime(hour.time),
                        temperature = hour.temperatureCelsius,
                        condition = WeatherCondition(
                            description = hour.condition.text,
                            iconUrl = hour.condition.iconUrl,
                            code = hour.condition.code
                        ),
                        windSpeed = hour.windKph,
                        humidity = hour.humidity,
                        feelsLike = hour.feelsLikeCelsius,
                        chanceOfRain = hour.chanceOfRain
                    )
                }
            )
        }

        return WeatherForecast(
            location = location,
            current = current,
            dailyForecasts = dailyForecasts
        )
    }

    private fun parseHourFromTime(timeString: String): Int {
        return try {
            // Format is like "2023-03-25 13:00"
            val hourPart = timeString.split(" ")[1].split(":")[0]
            hourPart.toInt()
        } catch (e: Exception) {
            0 // Default to 0 if parsing fails
        }
    }

    // For mock data when testing without API
    fun getMockWeatherForecast(): WeatherForecast {
        val location = Location(
            name = "New Delhi",
            region = "Delhi",
            country = "India",
            latitude = 28.61,
            longitude = 77.209,
            localTime = "2023-03-25 13:00"
        )

        val current = CurrentWeather(
            temperature = 31.1f,
            condition = WeatherCondition(
                description = "Clear skies. Proceed with regular irrigation.",
                iconUrl = "//cdn.weatherapi.com/weather/64x64/day/113.png",
                code = 1000
            ),
            windSpeed = 4.7f,
            humidity = 0,
            feelsLike = 33.6f,
            uvIndex = 7.0f
        )

        val calendar = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dayFormat = SimpleDateFormat("EEE", Locale.getDefault())

        val dailyForecasts = (0 until 7).map { dayOffset ->
            calendar.time = Date() // Reset to today
            calendar.add(Calendar.DAY_OF_YEAR, dayOffset)
            val date = dateFormat.format(calendar.time)
            val dayName = dayFormat.format(calendar.time)

            DailyForecast(
                date = date,
                maxTemp = 30f + (Math.random() * 8).toFloat() - 4f,
                minTemp = 22f + (Math.random() * 6).toFloat() - 3f,
                avgTemp = 26f + (Math.random() * 4).toFloat() - 2f,
                condition = WeatherCondition(
                    description = "Sunny",
                    iconUrl = "//cdn.weatherapi.com/weather/64x64/day/113.png",
                    code = 1000
                ),
                maxWindSpeed = 5f + (Math.random() * 3).toFloat(),
                precipitation = (Math.random() * 5).toFloat(),
                sunrise = "06:15 AM",
                sunset = "06:45 PM",
                hourlyForecasts = (0 until 24).map { hour ->
                    // Temperature variation throughout the day
                    val hourlyTemp = when (hour) {
                        in 0..5 -> 17f + (hour * 0.5f) // Early morning
                        in 6..11 -> 20f + ((hour - 6) * 2f) // Morning to noon
                        in 12..15 -> 32f - ((hour - 12) * 0.5f) // Afternoon
                        in 16..20 -> 30f - ((hour - 16) * 1.5f) // Evening
                        else -> 22f - ((hour - 21) * 1f) // Night
                    }

                    HourlyForecast(
                        time = "$date ${hour.toString().padStart(2, '0')}:00",
                        hour = hour,
                        temperature = hourlyTemp,
                        condition = WeatherCondition(
                            description = if (hour in 6..18) "Sunny" else "Clear",
                            iconUrl = if (hour in 6..18)
                                "//cdn.weatherapi.com/weather/64x64/day/113.png"
                            else
                                "//cdn.weatherapi.com/weather/64x64/night/113.png",
                            code = 1000
                        ),
                        windSpeed = 2f + (Math.random() * 3).toFloat(),
                        humidity = (10 + (Math.random() * 20).toInt()),
                        feelsLike = hourlyTemp + (Math.random() * 2).toFloat() - 1f,
                        chanceOfRain = 0
                    )
                }
            )
        }

        return WeatherForecast(
            location = location,
            current = current,
            dailyForecasts = dailyForecasts
        )
    }
}