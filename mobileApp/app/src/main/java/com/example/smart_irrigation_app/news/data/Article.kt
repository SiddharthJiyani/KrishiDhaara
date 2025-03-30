package com.example.smart_irrigation_app.news.data

// Data Models
data class Article(
    val source: Source,
    val author: String?,
    val title: String,
    val description: String?,
    val url: String,
    val urlToImage: String?,
    val publishedAt: String
)

// Data Model
data class LatestArticle(
    val title: String,
    val link: String,
    val image: String?,
    val category: String,
    val date: String,
    val source: String
)
