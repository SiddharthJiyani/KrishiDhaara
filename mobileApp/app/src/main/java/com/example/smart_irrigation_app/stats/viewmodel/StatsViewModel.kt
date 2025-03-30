package com.example.smart_irrigation_app.stats.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smart_irrigation_app.stats.domain.FetchForecastDataUseCase
import com.example.smart_irrigation_app.stats.domain.FetchPlantHealthHistoryUseCase
import com.example.smart_irrigation_app.stats.domain.ForecastData
import com.example.smart_irrigation_app.stats.domain.HealthData
import com.example.smart_irrigation_app.stats.domain.MonthlyData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class StatsViewModel(
    private val fetchPlantHealthHistoryUseCase: FetchPlantHealthHistoryUseCase,
    private val fetchForecastDataUseCase: FetchForecastDataUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(StatsUiState())
    val uiState: StateFlow<StatsUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        fetchPlantHealthHistory()
        fetchForecastData()
        // Initialize with mock monthly data
        _uiState.value = _uiState.value.copy(
            monthlyData = getMockMonthlyData()
        )
    }

    fun onTabSelected(tab: Tab) {
        _uiState.value = _uiState.value.copy(
            selectedTab = tab
        )
    }

    private fun fetchPlantHealthHistory() {
        viewModelScope.launch {
            try {
                val result = fetchPlantHealthHistoryUseCase()

                val healthyCount = result.healthyCount
                val unhealthyCount = result.unhealthyCount
                val totalCount = result.totalCount

                val healthyPercent = calculatePercentage(healthyCount, totalCount)
                val unhealthyPercent = calculatePercentage(unhealthyCount, totalCount)

                val healthDataList = listOf(
                    HealthData("Healthy", healthyPercent, "#10b981"),
                    HealthData("Unhealthy", unhealthyPercent, "#ef4444")
                )

                _uiState.value = _uiState.value.copy(
                    healthData = healthDataList,
                    healthyCount = healthyCount,
                    unhealthyCount = unhealthyCount,
                    totalCount = totalCount,
                    isLoading = false
                )
            } catch (e: Exception) {
                // In case of error, use mock data
                val mockHealthData = listOf(
                    HealthData("Healthy", 33.0, "#10b981"),
                    HealthData("Unhealthy", 67.0, "#ef4444")
                )

                _uiState.value = _uiState.value.copy(
                    healthData = mockHealthData,
                    healthyCount = 16,
                    unhealthyCount = 32,
                    totalCount = 48,
                    isLoading = false
                )
            }
        }
    }

    private fun fetchForecastData() {
        viewModelScope.launch {
            try {
                val forecastDataList = fetchForecastDataUseCase()
                _uiState.value = _uiState.value.copy(
                    forecastData = forecastDataList
                )
            } catch (e: Exception) {
                // Use mock forecast data in case of error
                _uiState.value = _uiState.value.copy(
                    forecastData = getMockForecastData()
                )
            }
        }
    }

    private fun calculatePercentage(part: Int, total: Int): Double {
        if (total == 0) return 0.0
        return (part.toDouble() / total.toDouble()) * 100.0
    }

    private fun getMockMonthlyData(): List<MonthlyData> {
        return listOf(
            MonthlyData("Jan", 120),
            MonthlyData("Feb", 125),
            MonthlyData("Mar", 110),
            MonthlyData("Apr", 150),
            MonthlyData("May", 180),
            MonthlyData("Jun", 210),
            MonthlyData("Jul", 235),
            MonthlyData("Aug", 220),
            MonthlyData("Sep", 170),
            MonthlyData("Oct", 140),
            MonthlyData("Nov", 125),
            MonthlyData("Dec", 120)
        )
    }

    private fun getMockForecastData(): List<ForecastData> {
        val dateFormat = SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH)
        return listOf(
            ForecastData(55.28, 28.5, "Fri, 28 Mar 2025 04:00:00 GMT"),
            ForecastData(58.58, 27.22, "Fri, 28 Mar 2025 08:00:00 GMT"),
            ForecastData(59.85, 26.28, "Fri, 28 Mar 2025 12:00:00 GMT"),
            ForecastData(60.32, 26.29, "Fri, 28 Mar 2025 16:00:00 GMT"),
            ForecastData(60.49, 26.44, "Fri, 28 Mar 2025 20:00:00 GMT"),
            ForecastData(60.55, 26.55, "Sat, 29 Mar 2025 00:00:00 GMT")
        )
    }
}

enum class Tab {
    WATER,
    PLANT,
    FORECAST
}

data class StatsUiState(
    val selectedTab: Tab = Tab.WATER,
    val monthlyData: List<MonthlyData> = emptyList(),
    val healthData: List<HealthData> = emptyList(),
    val forecastData: List<ForecastData> = emptyList(),
    val healthyCount: Int = 0,
    val unhealthyCount: Int = 0,
    val totalCount: Int = 0,
    val isLoading: Boolean = true
)