package com.example.smart_irrigation_app.diseasedetection.api

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface PlantHealthApiService {
    @Multipart
    @POST("predict/")
    suspend fun predictDisease(
        @Part file: MultipartBody.Part
    ): Response<PredictionResponse>
}

data class PredictionResponse(
    val predicted_disease: String,
    val cure: String
)

