package com.example.smart_irrigation_app.dashboard.domain

import com.example.smart_irrigation_app.dashboard.DashboardApiClient
import com.example.smart_irrigation_app.dashboard.data.AnalyticsData
import com.example.smart_irrigation_app.dashboard.data.DateRange
import com.example.smart_irrigation_app.dashboard.data.MinMaxDataPoint
import com.example.smart_irrigation_app.dashboard.data.ProcessedDataPoint
import com.example.smart_irrigation_app.dashboard.data.RelayState
import com.example.smart_irrigation_app.dashboard.data.SensorData


class DashboardRepository {
    private val apiService = DashboardApiClient.apiService

    suspend fun getRelayStates(): Result<Map<String, List<RelayState>>> {
        return try {
            val response = apiService.getRelayStates()
            if (response.success) {
                Result.success(response.message)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLatestSensorData(): Result<SensorData> {
        return try {
            val response = apiService.getLatestSensorData()
            if (response.success) {
                Result.success(response.message)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSensorList(sensorType: String): Result<List<String>> {
        return try {
            val response = apiService.getSensorList(sensorType)
            if (response.success) {
                Result.success(response.message.sensors)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAllTheSensorsList(): Result<List<String>> {
        return try {
            val response = apiService.getSensorList("humidity")
            val response2 = apiService.getSensorList("temperature")
            val list = response.message.sensors + response2.message.sensors
            if (response.success && response2.success) {
                Result.success(list)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAnalyticsData(
        sensorType: String,
        sensorId: String,
        dateRange: DateRange,
        analysisType: String
    ): Result<List<AnalyticsData>> {
        return try {
            val interval = when (analysisType) {
                "daily" -> "day"
                "monthly" -> "month"
                "yearly" -> "year"
                else -> "day"
            }

            val response = apiService.getAnalyticsData(
                sensorType = sensorType,
                sensorId = sensorId,
                startDate = dateRange.start,
                endDate = dateRange.end,
                interval = interval
            )

            if (response.success) {
                Result.success(response.message)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getInsights(): Result<String> {
        return try {
            val response = apiService.getInsights()
            if (response.success) {
                Result.success(response.message)
            } else {
                Result.failure(Exception("API returned unsuccessful response"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Helper functions to process data (similar to the JavaScript functions in the React code)
    fun processAnalyticsData(
        data: List<AnalyticsData>,
        analysisType: String,
        sensorType: String
    ): List<ProcessedDataPoint> {
        return when (analysisType) {
            "monthly" -> aggregateDataMonthly(data, sensorType)
            "yearly" -> aggregateDataYearly(data, sensorType)
            else -> aggregateDataDaily(data, sensorType)
        }
    }

    private fun aggregateDataDaily(
        data: List<AnalyticsData>,
        sensorType: String
    ): List<ProcessedDataPoint> {
        val dailyData = mutableMapOf<String, Pair<Float, Int>>()

        data.forEach { item ->
            // Parse date safely
            val formattedDate = try {
                // If it's already in the correct format (yyyy-MM-dd), use it directly
                if (item.id.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$"))) {
                    item.id
                }
                // If it's just a date with potentially different format, normalize it if possible
                else if (item.id.contains("-")) {
                    val parts = item.id.split("-")
                    if (parts.size >= 3) {
                        // Try to normalize to yyyy-MM-dd
                        val year = parts[0].padStart(4, '0')
                        val month = parts[1].padStart(2, '0')
                        val day = parts[2].take(2).padStart(2, '0')
                        "$year-$month-$day"
                    } else {
                        // Not enough parts for a full date, use as is
                        item.id
                    }
                } else {
                    // Not in a recognized format, use as is
                    item.id
                }
            } catch (e: Exception) {
                // If parsing fails, just use the original string
                item.id
            }

            val value = if (sensorType == "humidity") item.avgHumidity else item.avgTemperature
            if (value != null) {
                val currentData = dailyData[formattedDate]
                if (currentData == null) {
                    dailyData[formattedDate] = Pair(value, 1)
                } else {
                    dailyData[formattedDate] =
                        Pair(currentData.first + value, currentData.second + 1)
                }
            }
        }

        return dailyData.map { (date, valuePair) ->
            ProcessedDataPoint(
                time = date,
                value = valuePair.first / valuePair.second
            )
        }.sortedBy { it.time }
    }

    private fun aggregateDataMonthly(
        data: List<AnalyticsData>,
        sensorType: String
    ): List<ProcessedDataPoint> {
        val monthlyData = mutableMapOf<String, Pair<Float, Int>>()

        data.forEach { item ->
            // Extract the year-month safely
            val formattedDate = try {
                when {
                    // If it's already in yyyy-MM format
                    item.id.matches(Regex("^\\d{4}-\\d{2}$")) -> item.id

                    // If it's in yyyy-MM-dd format
                    item.id.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$")) -> item.id.substring(0, 7)

                    // If it contains hyphens but in a different format
                    item.id.contains("-") -> {
                        val parts = item.id.split("-")
                        if (parts.size >= 2) {
                            // Try to get year and month
                            val year = parts[0].padStart(4, '0')
                            val month = parts[1].padStart(2, '0')
                            "$year-$month"
                        } else {
                            // Only year is available, use year with January
                            "${parts[0]}-01"
                        }
                    }

                    // If it's just a year
                    item.id.matches(Regex("^\\d{4}$")) -> "${item.id}-01"

                    // Fallback
                    else -> item.id
                }
            } catch (e: Exception) {
                // If parsing fails, use original
                item.id
            }

            val value = if (sensorType == "humidity") item.avgHumidity else item.avgTemperature
            if (value != null) {
                val currentData = monthlyData[formattedDate]
                if (currentData == null) {
                    monthlyData[formattedDate] = Pair(value, 1)
                } else {
                    monthlyData[formattedDate] =
                        Pair(currentData.first + value, currentData.second + 1)
                }
            }
        }

        return monthlyData.map { (date, valuePair) ->
            ProcessedDataPoint(
                time = date,
                value = valuePair.first / valuePair.second
            )
        }.sortedBy { it.time }
    }

    private fun aggregateDataYearly(
        data: List<AnalyticsData>,
        sensorType: String
    ): List<ProcessedDataPoint> {
        val yearlyData = mutableMapOf<String, Pair<Float, Int>>()

        data.forEach { item ->
            // Extract the year safely without assuming a specific format
            val formattedDate = try {
                // Handle different possible formats of item.id
                when {
                    // If it's just a year (e.g., "2025")
                    item.id.matches(Regex("^\\d{4}$")) -> item.id

                    // If it contains hyphens (e.g., "2025-01-01" or "2025-01")
                    item.id.contains("-") -> {
                        val parts = item.id.split("-")
                        parts[0] // Take just the year part
                    }

                    // Fallback for any other format
                    else -> item.id
                }
            } catch (e: Exception) {
                // If parsing fails, just use the original string
                item.id
            }

            val value = if (sensorType == "humidity") item.avgHumidity else item.avgTemperature
            if (value != null) {
                val currentData = yearlyData[formattedDate]
                if (currentData == null) {
                    yearlyData[formattedDate] = Pair(value, 1)
                } else {
                    yearlyData[formattedDate] =
                        Pair(currentData.first + value, currentData.second + 1)
                }
            }
        }

        return yearlyData.map { (date, valuePair) ->
            ProcessedDataPoint(
                time = date,
                value = valuePair.first / valuePair.second
            )
        }.sortedBy { it.time }
    }

    fun getMinMaxHumidityData(data: List<AnalyticsData>): List<MinMaxDataPoint> {
        val minMaxData = mutableMapOf<String, Pair<Float, Float>>()

        data.forEach { item ->
            // Parse date safely for min/max data
            val formattedDate = try {
                // If it's already in the correct format
                if (item.id.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$"))) {
                    item.id
                }
                // If it's in a different format with hyphens
                else if (item.id.contains("-")) {
                    val parts = item.id.split("-")
                    if (parts.size >= 3) {
                        // Try to normalize to yyyy-MM-dd
                        val year = parts[0].padStart(4, '0')
                        val month = parts[1].padStart(2, '0')
                        val day = parts[2].take(2).padStart(2, '0')
                        "$year-$month-$day"
                    } else if (parts.size == 2) {
                        // It's a year-month, add a day
                        "${parts[0]}-${parts[1]}-01"
                    } else {
                        // Only year is available
                        "${parts[0]}-01-01"
                    }
                }
                // If it's just a year
                else if (item.id.matches(Regex("^\\d{4}$"))) {
                    "${item.id}-01-01"
                } else {
                    // Not in a recognized format
                    item.id
                }
            } catch (e: Exception) {
                // If parsing fails, use original
                item.id
            }

            val minValue = item.minHumidity
            val maxValue = item.maxHumidity

            if (minValue != null && maxValue != null) {
                val currentPair = minMaxData[formattedDate]
                if (currentPair == null) {
                    minMaxData[formattedDate] = Pair(minValue, maxValue)
                } else {
                    minMaxData[formattedDate] = Pair(
                        minOf(currentPair.first, minValue),
                        maxOf(currentPair.second, maxValue)
                    )
                }
            }
        }

        return minMaxData.map { (date, pair) ->
            MinMaxDataPoint(
                time = date,
                min = pair.first,
                max = pair.second
            )
        }.sortedBy { it.time }
    }

    fun getMinMaxTemperatureData(data: List<AnalyticsData>): List<MinMaxDataPoint> {
        val minMaxData = mutableMapOf<String, Pair<Float, Float>>()

        data.forEach { item ->
            // Parse date safely for temperature min/max data
            val formattedDate = try {
                // If it's already in the correct format
                if (item.id.matches(Regex("^\\d{4}-\\d{2}-\\d{2}$"))) {
                    item.id
                }
                // If it's in a different format with hyphens
                else if (item.id.contains("-")) {
                    val parts = item.id.split("-")
                    if (parts.size >= 3) {
                        // Try to normalize to yyyy-MM-dd
                        val year = parts[0].padStart(4, '0')
                        val month = parts[1].padStart(2, '0')
                        val day = parts[2].take(2).padStart(2, '0')
                        "$year-$month-$day"
                    } else if (parts.size == 2) {
                        // It's a year-month, add a day
                        "${parts[0]}-${parts[1]}-01"
                    } else {
                        // Only year is available
                        "${parts[0]}-01-01"
                    }
                }
                // If it's just a year
                else if (item.id.matches(Regex("^\\d{4}$"))) {
                    "${item.id}-01-01"
                } else {
                    // Not in a recognized format
                    item.id
                }
            } catch (e: Exception) {
                // If parsing fails, use original
                item.id
            }

            val minValue = item.minTemperature
            val maxValue = item.maxTemperature

            if (minValue != null && maxValue != null) {
                val currentPair = minMaxData[formattedDate]
                if (currentPair == null) {
                    minMaxData[formattedDate] = Pair(minValue, maxValue)
                } else {
                    minMaxData[formattedDate] = Pair(
                        minOf(currentPair.first, minValue),
                        maxOf(currentPair.second, maxValue)
                    )
                }
            }
        }

        return minMaxData.map { (date, pair) ->
            MinMaxDataPoint(
                time = date,
                min = pair.first,
                max = pair.second
            )
        }.sortedBy { it.time }
    }
}
