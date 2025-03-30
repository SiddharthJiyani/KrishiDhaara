package com.example.smart_irrigation_app.dashboard.domain

import com.example.smart_irrigation_app.dashboard.data.AnalyticsData
import com.example.smart_irrigation_app.dashboard.data.ApiResponse
import com.example.smart_irrigation_app.dashboard.data.RelayState
import com.example.smart_irrigation_app.dashboard.data.SensorData
import com.example.smart_irrigation_app.dashboard.data.SensorListResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface DashApiService {
    @GET("SensorData/getLatest")
    suspend fun getLatestSensorData(): ApiResponse<SensorData>

    @GET("SensorData/getSensor/{sensorType}")
    suspend fun getSensorList(
        @Path("sensorType") sensorType: String
    ): ApiResponse<SensorListResponse>

    @GET("SensorData/{sensorType}/getAnalytics/{sensorId}")
    suspend fun getAnalyticsData(
        @Path("sensorType") sensorType: String,
        @Path("sensorId") sensorId: String,
        @Query("startStamp") startDate: String,
        @Query("endStamp") endDate: String,
        @Query("interval") interval: String
    ): ApiResponse<List<AnalyticsData>>

    @GET("SensorData/relay/getState")
    suspend fun getRelayStates(): ApiResponse<Map<String, List<RelayState>>>

    @GET("SensorData/getInsights")
    suspend fun getInsights(): ApiResponse<String>
}