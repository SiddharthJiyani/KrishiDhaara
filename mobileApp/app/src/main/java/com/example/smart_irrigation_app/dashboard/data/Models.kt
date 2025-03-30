package com.example.smart_irrigation_app.dashboard.data

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: T
)

data class SensorData(
    @SerializedName("resultHumi") val resultHumi: HumidityData? = null,
    @SerializedName("resultTemp") val resultTemp: TemperatureData? = null
)

data class HumidityData(
    @SerializedName("humidity") val humidity: String
)

data class TemperatureData(
    @SerializedName("temperature") val temperature: String
)

data class SensorListResponse(
    @SerializedName("sensors") val sensors: List<String>
)

data class AnalyticsData(
    @SerializedName("_id") val id: String,
    @SerializedName("avgHumidity") val avgHumidity: Float? = null,
    @SerializedName("minHumidity") val minHumidity: Float? = null,
    @SerializedName("maxHumidity") val maxHumidity: Float? = null,
    @SerializedName("avgTemperature") val avgTemperature: Float? = null,
    @SerializedName("minTemperature") val minTemperature: Float? = null,
    @SerializedName("maxTemperature") val maxTemperature: Float? = null
)

data class RelayState(
    @SerializedName("sensorNumber") val id: String,
    @SerializedName("state") val state: String
)

data class ProcessedDataPoint(
    val time: String,
    val value: Float
)

data class MinMaxDataPoint(
    val time: String,
    val min: Float,
    val max: Float
)

data class DateRange(
    val start: String,
    val end: String
)
