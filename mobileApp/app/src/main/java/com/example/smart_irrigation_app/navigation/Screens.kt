package com.example.smart_irrigation_app.navigation

import android.os.Build
import androidx.annotation.DrawableRes
import androidx.annotation.RequiresApi
import androidx.compose.runtime.Composable
import com.example.smart_irrigation_app.R
import com.example.smart_irrigation_app.dashboard.DashHolder
import com.example.smart_irrigation_app.diseasedetection.DiseaseDetectionScreen
import com.example.smart_irrigation_app.news.presentation.NewsPresenter
import com.example.smart_irrigation_app.stats.StatsScreen
import com.example.smart_irrigation_app.tips.TipsScreen
import com.example.smart_irrigation_app.weather.presentation.WeatherScreen

sealed class Screen(
    val title: String,
    val route: String,
) {
    sealed class BottomBarScreen(
        val bTitle: String,
        val bRoute: String,
        @DrawableRes val icon: Int
    ) : Screen(bTitle, bRoute) {
        object Dashboard : BottomBarScreen(
            "Dashboard",
            "dash",
            R.drawable.baseline_space_dashboard_24
        )

        object Weather : BottomBarScreen(
            "Weather Prediction",
            "weather",
            R.drawable.baseline_wb_cloudy_24
        )

        object PlantHealth : BottomBarScreen(
            "Plant Health",
            "planthealth",
            R.drawable.baseline_health_and_safety_24
        )

        object News : BottomBarScreen(
            "News",
            "news",
            R.drawable.baseline_newspaper_24
        )

        object CareTips : BottomBarScreen(
            "Care Tips",
            "caretips",
            R.drawable.baseline_menu_book_24
        )

        object Statistics : BottomBarScreen(
            "Statistics",
            "stats",
            R.drawable.baseline_analytics_24
        )
    }
}

val myBottomScreens = listOf(
    Screen.BottomBarScreen.Dashboard,
    Screen.BottomBarScreen.Weather,
    Screen.BottomBarScreen.PlantHealth,
    Screen.BottomBarScreen.News,
    Screen.BottomBarScreen.CareTips,
    Screen.BottomBarScreen.Statistics
)

@RequiresApi(Build.VERSION_CODES.O)
val myBottomScreenViews = listOf<@Composable () -> Unit>(
    { DashHolder() }, //dash
    { WeatherScreen({}) }, //weather
    { DiseaseDetectionScreen({}) }, //plant health
    { NewsPresenter() }, //news
    { TipsScreen() }, //care tips
    { StatsScreen() }, //statistics
)