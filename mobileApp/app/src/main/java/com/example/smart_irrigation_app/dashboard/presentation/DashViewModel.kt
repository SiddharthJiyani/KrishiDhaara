package com.example.smart_irrigation_app.dashboard.presentation

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smart_irrigation_app.dashboard.data.AnalyticsData
import com.example.smart_irrigation_app.dashboard.data.DateRange
import com.example.smart_irrigation_app.dashboard.data.MinMaxDataPoint
import com.example.smart_irrigation_app.dashboard.data.ProcessedDataPoint
import com.example.smart_irrigation_app.dashboard.data.SensorData
import com.example.smart_irrigation_app.dashboard.domain.DashboardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DashViewModel : ViewModel() {
    private val repository = DashboardRepository()

    // State management
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        _uiState.update { it.copy(loading = true) }
        // Set default values and fetch initial data
        val currentDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val startDate = "2025-01-01" // Default from React code

        _uiState.update {
            it.copy(
                dateRange = DateRange(start = startDate, end = currentDate),
                analysisType = "daily",
                selectedSensorType = "humidity",
            )
        }

        fetchSensorData()
        fetchSensorList()
        fetchAnalyticsData()
    }

    fun fetchSensorData() {
        viewModelScope.launch {
            repository.getLatestSensorData().fold(
                onSuccess = { data ->
                    _uiState.update {
                        it.copy(
                            sensorData = data,
                            loading = false
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            error = error.message ?: "Failed to fetch sensor data",
                            loading = false
                        )
                    }
                }
            )
        }
    }

    fun fetchSensorList() {
        viewModelScope.launch {
            repository.getAllTheSensorsList().fold(
                onSuccess = { sensors ->
                    _uiState.update { currentState ->
                        // Set first sensor as selected when list loads
                        val selectedSensor = if (sensors.isNotEmpty()) sensors[0] else ""
                        currentState.copy(
                            sensorList = sensors,
                            selectedSensor = selectedSensor,
                            loading = false
                        )
                    }

                    // If we have a sensor, fetch analytics data
                    if (_uiState.value.selectedSensor.isNotEmpty()) {
                        fetchAnalyticsData()
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            error = error.message ?: "Failed to fetch sensor list",
                            loading = false
                        )
                    }
                }
            )
        }
    }

    fun fetchAnalyticsData() {
        val currentState = _uiState.value
        if (currentState.selectedSensor.isEmpty()) return

        viewModelScope.launch {
            repository.getAnalyticsData(
                sensorType = currentState.selectedSensorType,
                sensorId = currentState.selectedSensor,
                dateRange = currentState.dateRange,
                analysisType = currentState.analysisType
            ).fold(
                onSuccess = { data ->
                    val processedData = repository.processAnalyticsData(
                        data,
                        currentState.analysisType,
                        currentState.selectedSensorType
                    )

                    val minMaxData = if (currentState.selectedSensorType == "humidity") {
                        repository.getMinMaxHumidityData(data)
                    } else {
                        repository.getMinMaxTemperatureData(data)
                    }

                    _uiState.update {
                        it.copy(
                            analyticsData = data,
                            processedData = processedData,
                            minMaxData = minMaxData,
                            loading = false
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            error = error.message ?: "Failed to fetch analytics data",
                            loading = false
                        )
                    }
                }
            )
        }
    }

    fun fetchInsights() {
        viewModelScope.launch {
            _uiState.update { it.copy(insightsLoading = true) }

            repository.getInsights().fold(
                onSuccess = { insights ->
                    _uiState.update {
                        it.copy(
                            insights = insights,
                            insightsLoading = false
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            insightsError = error.message ?: "Failed to fetch insights",
                            insightsLoading = false
                        )
                    }
                }
            )
        }
    }

    fun updateDateRange(start: String? = null, end: String? = null) {
        val currentRange = _uiState.value.dateRange
        val newRange = DateRange(
            start = start ?: currentRange.start,
            end = end ?: currentRange.end
        )
        _uiState.update { it.copy(dateRange = newRange) }
        fetchAnalyticsData()
    }

    fun updateAnalysisType(type: String) {
        Log.d("AnalyticsType", "updateAnalysisType: " + type)
        _uiState.update { it.copy(analysisType = type) }
        fetchAnalyticsData()
    }

    fun updateSensorType(type: String) {
        _uiState.update { it.copy(selectedSensorType = type) }
        fetchSensorList()
    }

    fun updateSelectedSensor(sensorId: String) {
        _uiState.update { it.copy(selectedSensor = sensorId) }
        fetchAnalyticsData()
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    fun clearInsightsError() {
        _uiState.update { it.copy(insightsError = null) }
    }
}

data class DashboardUiState(
    val activeTab: String = "overview",
    val dateRange: DateRange = DateRange("", ""),
    val analysisType: String = "daily",
    val selectedSensorType: String = "humidity",
    val selectedSensor: String = "",
    val sensorData: SensorData? = null,
    val sensorList: List<String> = emptyList(),
    val analyticsData: List<AnalyticsData> = emptyList(),
    val processedData: List<ProcessedDataPoint> = emptyList(),
    val minMaxData: List<MinMaxDataPoint> = emptyList(),
    val insights: String? = null,
    val loading: Boolean = false,
    val insightsLoading: Boolean = false,
    val error: String? = null,
    val insightsError: String? = null
)