package com.example.smart_irrigation_app.news.data

data class NewsResponse(
    val status: String,
    val totalResults: Int,
    val articles: List<Article>
)