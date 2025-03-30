package com.example.smart_irrigation_app.news.latestnews

import com.example.smart_irrigation_app.news.data.LatestArticle
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET

data class NewsResponse(
    val numArticles: Int,
    val news: List<LatestArticle>
)

// Retrofit API Service
interface NewsService {
    @GET("api/news") // Replace with actual endpoint
    suspend fun fetchNews(): NewsResponse
}

// Repository (Simple API Fetcher)
object LatestNewsRepository {
    private val retrofit = Retrofit.Builder()
        .baseUrl("https://irrigation-node-backend.vercel.app/") // Replace with actual base URL
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val service = retrofit.create(NewsService::class.java)

    suspend fun fetchLatestNews() = service.fetchNews().news
}
