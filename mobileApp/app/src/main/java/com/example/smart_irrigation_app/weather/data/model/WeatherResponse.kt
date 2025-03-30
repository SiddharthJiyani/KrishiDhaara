package com.example.smart_irrigation_app.weather.data.model

import com.google.gson.annotations.SerializedName

data class WeatherResponse(
    @SerializedName("location") val location: LocationDto,
    @SerializedName("current") val current: CurrentWeatherDto,
    @SerializedName("forecast") val forecast: ForecastDto
)

data class LocationDto(
    @SerializedName("name") val name: String,
    @SerializedName("region") val region: String,
    @SerializedName("country") val country: String,
    @SerializedName("lat") val latitude: Double,
    @SerializedName("lon") val longitude: Double,
    @SerializedName("localtime") val localTime: String
)

data class CurrentWeatherDto(
    @SerializedName("temp_c") val temperatureCelsius: Float,
    @SerializedName("condition") val condition: WeatherConditionDto,
    @SerializedName("wind_kph") val windKph: Float,
    @SerializedName("humidity") val humidity: Int,
    @SerializedName("feelslike_c") val feelsLikeCelsius: Float,
    @SerializedName("uv") val uvIndex: Float
)

data class WeatherConditionDto(
    @SerializedName("text") val text: String,
    @SerializedName("icon") val iconUrl: String,
    @SerializedName("code") val code: Int
)

data class ForecastDto(
    @SerializedName("forecastday") val forecastDays: List<ForecastDayDto>
)

data class ForecastDayDto(
    @SerializedName("date") val date: String,
    @SerializedName("day") val day: DayForecastDto,
    @SerializedName("astro") val astro: AstroDto,
    @SerializedName("hour") val hours: List<HourForecastDto>
)

data class DayForecastDto(
    @SerializedName("maxtemp_c") val maxTempCelsius: Float,
    @SerializedName("mintemp_c") val minTempCelsius: Float,
    @SerializedName("avgtemp_c") val avgTempCelsius: Float,
    @SerializedName("maxwind_kph") val maxWindKph: Float,
    @SerializedName("totalprecip_mm") val totalPrecipMm: Float,
    @SerializedName("condition") val condition: WeatherConditionDto,
    @SerializedName("uv") val uvIndex: Float
)

data class AstroDto(
    @SerializedName("sunrise") val sunrise: String,
    @SerializedName("sunset") val sunset: String,
    @SerializedName("moonrise") val moonrise: String,
    @SerializedName("moonset") val moonset: String,
    @SerializedName("moon_phase") val moonPhase: String
)

data class HourForecastDto(
    @SerializedName("time") val time: String,
    @SerializedName("temp_c") val temperatureCelsius: Float,
    @SerializedName("condition") val condition: WeatherConditionDto,
    @SerializedName("wind_kph") val windKph: Float,
    @SerializedName("humidity") val humidity: Int,
    @SerializedName("feelslike_c") val feelsLikeCelsius: Float,
    @SerializedName("will_it_rain") val willItRain: Int,
    @SerializedName("chance_of_rain") val chanceOfRain: Int
)