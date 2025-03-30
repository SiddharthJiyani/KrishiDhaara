package com.example.smart_irrigation_app.news.domain

import com.example.smart_irrigation_app.news.data.NewsResponse
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Repository
class NewsRepository {
    private val api: NewsApi

    init {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://newsapi.org/v2/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        api = retrofit.create(NewsApi::class.java)
    }

    suspend fun fetchAgricultureNews(): NewsResponse =
        api.getAgricultureNews("agriculture", "fbaab164d1f44f429c232b5c8d8d3791")

    suspend fun fetchScienceNews(): NewsResponse =
        api.getScienceNews("us", "science", "fbaab164d1f44f429c232b5c8d8d3791")
}