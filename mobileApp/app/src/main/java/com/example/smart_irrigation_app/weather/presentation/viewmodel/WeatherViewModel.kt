package com.example.smart_irrigation_app.weather.presentation.viewmodel

import android.location.Location
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smart_irrigation_app.weather.data.repository.WeatherRepositoryImpl
import com.example.smart_irrigation_app.weather.domain.model.WeatherForecast
import com.example.smart_irrigation_app.weather.domain.usecase.GetWeatherForecastUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class WeatherViewModel : ViewModel() {

    // In a real app, these would be injected, but for simplicity we're creating them directly
    private val weatherRepository = WeatherRepositoryImpl()
    private val getWeatherForecastUseCase = GetWeatherForecastUseCase(weatherRepository)

    private val _uiState = MutableStateFlow(WeatherUiState())
    val uiState: StateFlow<WeatherUiState> = _uiState.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedDayIndex = MutableStateFlow(0)
    val selectedDayIndex: StateFlow<Int> = _selectedDayIndex.asStateFlow()

    init {
        viewModelScope.launch {
            val mockData = weatherRepository.getMockWeatherForecast()
            updateWeatherData(mockData)
        }
    }

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun onSearchSubmitted() {
        val query = _searchQuery.value.trim()
        if (query.isNotEmpty()) {
            loadWeatherForecast(query)
        }
    }

    fun loadWeatherForecast(locationQuery: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val result = getWeatherForecastUseCase(locationQuery)
            result.fold(
                onSuccess = { forecast ->
                    updateWeatherData(forecast)
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error.message ?: "Failed to fetch weather data"
                        )
                    }
                }
            )
        }
    }

    fun loadWeatherForecastByLocation(location: Location) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val result = getWeatherForecastUseCase(location.latitude, location.longitude)
            Log.d("Weather", "loadWeatherForecastByLocation: " + result)
            result.fold(
                onSuccess = { forecast ->
                    updateWeatherData(forecast)
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error.message ?: "Failed to fetch weather data"
                        )
                    }
                }
            )
        }
    }

    fun selectDay(index: Int) {
        if (index in 0 until (_uiState.value.weatherForecast?.dailyForecasts?.size ?: 0)) {
            _selectedDayIndex.value = index
            updateHourlyData()
        }
    }

    private fun updateWeatherData(forecast: WeatherForecast) {
        _uiState.update {
            it.copy(
                isLoading = false,
                error = null,
                weatherForecast = forecast,
                currentLocation = "${forecast.location.name}, ${forecast.location.country}",
                coordinates = "${forecast.location.latitude}, ${forecast.location.longitude}",
                date = formatDate(Date()),
                hourlyTemperatureData = extractHourlyTemperatureData(forecast.dailyForecasts[0])
            )
        }
        // Set default selected day to today (index 0)
        _selectedDayIndex.value = 0
    }

    private fun updateHourlyData() {
        val forecast = _uiState.value.weatherForecast ?: return
        val selectedDayIndex = _selectedDayIndex.value

        if (selectedDayIndex in forecast.dailyForecasts.indices) {
            val selectedDayForecast = forecast.dailyForecasts[selectedDayIndex]
            _uiState.update {
                it.copy(hourlyTemperatureData = extractHourlyTemperatureData(selectedDayForecast))
            }
        }
    }

    private fun extractHourlyTemperatureData(dayForecast: com.example.smart_irrigation_app.weather.domain.model.DailyForecast): List<HourlyTemperaturePoint> {
        return dayForecast.hourlyForecasts.map { hourForecast ->
            HourlyTemperaturePoint(
                hour = hourForecast.hour,
                temperature = hourForecast.temperature,
                displayTime = formatHour(hourForecast.hour)
            )
        }
    }

    private fun formatDate(date: Date): String {
        val dayFormat = SimpleDateFormat("EEEE, MMM d", Locale.getDefault())
        return dayFormat.format(date)
    }

    private fun formatHour(hour: Int): String {
        return when {
            hour == 0 -> "12 AM"
            hour < 12 -> "$hour AM"
            hour == 12 -> "12 PM"
            else -> "${hour - 12} PM"
        }
    }
}

data class WeatherUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val weatherForecast: WeatherForecast? = null,
    val currentLocation: String = "",
    val coordinates: String = "",
    val date: String = "",
    val hourlyTemperatureData: List<HourlyTemperaturePoint> = emptyList()
)

data class HourlyTemperaturePoint(
    val hour: Int,
    val temperature: Float,
    val displayTime: String
)