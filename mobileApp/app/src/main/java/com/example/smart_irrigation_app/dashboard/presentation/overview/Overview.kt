package com.example.smart_irrigation_app.dashboard.presentation.overview

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.dashboard.presentation.AnalysisTypeSelector
import com.example.smart_irrigation_app.dashboard.presentation.AreaChart
import com.example.smart_irrigation_app.dashboard.presentation.ChartCard
import com.example.smart_irrigation_app.dashboard.presentation.DashboardUiState
import com.example.smart_irrigation_app.dashboard.presentation.DateRangePicker
import com.example.smart_irrigation_app.dashboard.presentation.ErrorMessage
import com.example.smart_irrigation_app.dashboard.presentation.InsightsButton
import com.example.smart_irrigation_app.dashboard.presentation.InsightsCard
import com.example.smart_irrigation_app.dashboard.presentation.LoadingIndicator
import com.example.smart_irrigation_app.dashboard.presentation.MultiLineChart
import com.example.smart_irrigation_app.dashboard.presentation.SensorDropdown
import com.example.smart_irrigation_app.dashboard.presentation.SensorTypeDropdown
import com.example.smart_irrigation_app.dashboard.presentation.StatCard
import com.example.smart_irrigation_app.ui.theme.Green

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OverviewScreen(
    uiState: DashboardUiState,
    onDateRangeChanged: (start: String?, end: String?) -> Unit,
    onAnalysisTypeChanged: (String) -> Unit,
    onSensorTypeChanged: (String) -> Unit,
    onSensorChanged: (String) -> Unit,
    onGetInsights: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
            .verticalScroll(scrollState)
    ) {
        if (uiState.loading) {
            LoadingIndicator()
        } else {
            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Soil Moisture",
                    value = uiState.sensorData?.resultHumi?.humidity ?: "N/A",
                    optimal = "40-60%",
                    progress = 85f,
                    icon = {
                        Icon(
                            imageVector = Icons.Default.WaterDrop,
                            contentDescription = null,
                            tint = Green
                        )
                    },
                    modifier = Modifier.weight(1f)
                )

                StatCard(
                    title = "Temperature",
                    value = uiState.sensorData?.resultTemp?.temperature ?: "N/A",
                    optimal = "18-26°C",
                    progress = 45.6f,
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Thermostat,
                            contentDescription = null,
                            tint = Green
                        )
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Data Filters Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.padding(8.dp)
                ) {
                    Text(
                        text = "Data Filters",
                        style = MaterialTheme.typography.titleLarge,
                        color = Green,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Date Range
                    DateRangePicker(
                        startDate = uiState.dateRange.start,
                        endDate = uiState.dateRange.end,
                        onStartDateSelected = { newStart -> onDateRangeChanged(newStart, null) },
                        onEndDateSelected = { newEnd -> onDateRangeChanged(null, newEnd) }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Analysis Type
                    Text(
                        text = "Analysis Type",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    AnalysisTypeSelector(
                        selectedType = uiState.analysisType,
                        onTypeSelected = onAnalysisTypeChanged
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Sensor Type
                    Text(
                        text = "Sensor Type",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    SensorTypeDropdown(
                        selectedType = uiState.selectedSensorType,
                        onTypeSelected = onSensorTypeChanged
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Sensor Selection
                    Text(
                        text = "Sensor",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    SensorDropdown(
                        sensors = uiState.sensorList,
                        selectedSensor = uiState.selectedSensor,
                        onSensorSelected = onSensorChanged
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Charts
            if (uiState.processedData.isNotEmpty()) {
                // Main Trend Chart
                ChartCard(
                    title = if (uiState.selectedSensorType == "humidity") "Soil Moisture Trends" else "Temperature Trends",
                    subtitle = "Monitoring data based on selected time range",
                    chartContent = {
                        AreaChart(
                            data = uiState.processedData,
                            bodyColor = if (uiState.selectedSensorType == "humidity")
                                Color(0xFF10B981) else Color(0xFFF59E0B),
                            backgroundColor = if (uiState.selectedSensorType == "humidity")
                                Color(0x3310B981) else Color(0x33F59E0B),
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Min/Max Chart
                if (uiState.minMaxData.isNotEmpty()) {
                    ChartCard(
                        title = if (uiState.selectedSensorType == "humidity")
                            "Max/Min Humidity Trends" else "Max/Min Temperature Trends",
                        subtitle = "Date-wise maximum and minimum data",
                        chartContent = {
                            MultiLineChart(
                                data = uiState.minMaxData,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Insights Button
            InsightsButton(
                onClick = onGetInsights,
                isLoading = uiState.insightsLoading
            )

            // Insights Card
            if (uiState.insights != null && !uiState.insightsLoading) {
                Spacer(modifier = Modifier.height(8.dp))
                InsightsCard(insights = uiState.insights)
            }

            // Show error if any
            uiState.insightsError?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                ErrorMessage(
                    message = error,
                    onDismiss = { /* TODO: Implement clear error */ }
                )
            }
        }
    }
}