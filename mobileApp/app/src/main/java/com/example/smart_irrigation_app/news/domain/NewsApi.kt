package com.example.smart_irrigation_app.news.domain

import com.example.smart_irrigation_app.news.data.NewsResponse
import retrofit2.http.GET
import retrofit2.http.Query

// Retrofit API Interface
interface NewsApi {
    @GET("everything")
    suspend fun getAgricultureNews(
        @Query("q") query: String,
        @Query("apiKey") apiKey: String
    ): NewsResponse

    @GET("top-headlines")
    suspend fun getScienceNews(
        @Query("country") country: String,
        @Query("category") category: String,
        @Query("apiKey") apiKey: String
    ): NewsResponse
}
