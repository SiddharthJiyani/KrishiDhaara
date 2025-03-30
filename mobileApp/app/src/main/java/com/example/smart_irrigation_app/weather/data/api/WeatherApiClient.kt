package com.example.smart_irrigation_app.weather.data.api

// Create an API client with Retrofit
object WeatherApiClient {
    private const val BASE_URL = "https://api.weatherapi.com/v1/"
    private const val API_KEY =
        "9778b41204344d61b10234754252403" // Replace with your actual API key

    // Retrofitting instance creation is usually done with a DI framework
    // But for simplicity, we'll create it directly here
    private val retrofit by lazy {
        retrofit2.Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(retrofit2.converter.gson.GsonConverterFactory.create())
            .client(
                okhttp3.OkHttpClient.Builder()
                    .addInterceptor(okhttp3.logging.HttpLoggingInterceptor().apply {
                        level = okhttp3.logging.HttpLoggingInterceptor.Level.BODY
                    })
                    .build()
            )
            .build()
    }

    val service: WeatherApiService by lazy {
        retrofit.create(WeatherApiService::class.java)
    }

    fun getApiKey(): String = API_KEY
}