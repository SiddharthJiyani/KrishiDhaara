package com.example.smart_irrigation_app.stats

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.MutableTransitionState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.EnergySavingsLeaf
import androidx.compose.material.icons.outlined.Cloud
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smart_irrigation_app.stats.components.BarChart
import com.example.smart_irrigation_app.stats.components.DoughnutChart
import com.example.smart_irrigation_app.stats.components.ForecastChart
import com.example.smart_irrigation_app.stats.data.StatsApi
import com.example.smart_irrigation_app.stats.data.StatsNetworkService
import com.example.smart_irrigation_app.stats.data.StatsRepositoryImpl
import com.example.smart_irrigation_app.stats.domain.FetchForecastDataUseCase
import com.example.smart_irrigation_app.stats.domain.FetchPlantHealthHistoryUseCase
import com.example.smart_irrigation_app.stats.viewmodel.StatsViewModel
import com.example.smart_irrigation_app.stats.viewmodel.Tab
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.Blue
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.KrishiTypography
import com.example.smart_irrigation_app.ui.theme.greenBrush

@Composable
fun StatsScreen() {

    val statsApi = StatsNetworkService.retrofit.create(StatsApi::class.java)
    val statsRepository = StatsRepositoryImpl(statsApi)
    val fetchPlantHealthHistoryUseCase = FetchPlantHealthHistoryUseCase(statsRepository)
    val fetchForecastDataUseCase = FetchForecastDataUseCase(statsRepository)
    val viewModel = StatsViewModel(fetchPlantHealthHistoryUseCase, fetchForecastDataUseCase)


    val uiState by viewModel.uiState.collectAsState()

    val fadeInState = remember {
        MutableTransitionState(false).apply { targetState = true }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Header
        item {
            AnimatedVisibility(
                visibleState = fadeInState,
                enter = fadeIn(animationSpec = tween(durationMillis = 500)) +
                        slideInVertically(
                            initialOffsetY = { -40 },
                            animationSpec = tween(durationMillis = 500)
                        ),
                exit = fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                ) {
                    Text(
                        text = "Statistics & Analytics",
                        color = Blue,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Detailed insights and trends from your smart irrigation system",
                        color = Color.Gray,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }

        // Tab Row
        item {
            AnimatedVisibility(
                visibleState = fadeInState,
                enter = fadeIn(animationSpec = tween(durationMillis = 500, delayMillis = 200)),
                exit = fadeOut()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TabRow(
                        selectedTabIndex = uiState.selectedTab.ordinal,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF27272A)),
                        containerColor = Color(0xFF27272A),
                        contentColor = Color.White,
                        divider = {}
                    ) {
                        TabItem(
                            title = "Water Usage",
                            icon = Icons.Default.BarChart,
                            isSelected = uiState.selectedTab == Tab.WATER,
                            onClick = { viewModel.onTabSelected(Tab.WATER) }
                        )

                        TabItem(
                            title = "Plant Health",
                            icon = Icons.Default.EnergySavingsLeaf,
                            isSelected = uiState.selectedTab == Tab.PLANT,
                            onClick = { viewModel.onTabSelected(Tab.PLANT) }
                        )

                        TabItem(
                            title = "Soil Condition Forecast",
                            icon = Icons.Outlined.Cloud,
                            isSelected = uiState.selectedTab == Tab.FORECAST,
                            onClick = { viewModel.onTabSelected(Tab.FORECAST) }
                        )
                    }
                }
            }
        }

        // Main Chart Card
        item {
            AnimatedVisibility(
                visibleState = fadeInState,
                enter = fadeIn(animationSpec = tween(durationMillis = 700, delayMillis = 300)) +
                        slideInVertically(
                            initialOffsetY = { 40 },
                            animationSpec = tween(durationMillis = 700, delayMillis = 300)
                        ),
                exit = fadeOut()
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Black
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        // Title and description based on selected tab
                        Text(
                            text = when (uiState.selectedTab) {
                                Tab.WATER -> "Water Usage Analysis"
                                Tab.PLANT -> "Plant Health Analysis"
                                Tab.FORECAST -> "Soil Condition Forecast Analysis"
                            },
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Medium
                        )

                        Text(
                            text = when (uiState.selectedTab) {
                                Tab.WATER -> "Monthly water consumption compared to average usage"
                                Tab.PLANT -> "Distribution of plant health metrics based on predictions being done by the farmer for his field"
                                Tab.FORECAST -> "Temperature and moisture predictions for the next 24 hours coming from our trained AI model"
                            },
                            color = Color.Gray,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                        )

                        // Chart based on selected tab
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            if (uiState.isLoading) {
                                CircularProgressIndicator(color = Blue)
                            } else {
                                when (uiState.selectedTab) {
                                    Tab.WATER -> {
                                        if (!uiState.monthlyData.isEmpty()) {
                                            BarChart(data = uiState.monthlyData)
                                        }
                                    }

                                    Tab.PLANT -> {
                                        if (!uiState.healthData.isEmpty()) {
                                            Column(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalAlignment = Alignment.CenterHorizontally
                                            ) {
                                                Box(
                                                    modifier = Modifier
                                                        .padding(horizontal = 16.dp),
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    DoughnutChart(data = uiState.healthData)
                                                }

                                                Column(modifier = Modifier.padding(top = 8.dp)) {
                                                    // Stats cards
                                                    StatsCard(
                                                        title = "Healthy Predictions",
                                                        value = uiState.healthyCount.toString(),
                                                        color = Color(0xFF10B981)
                                                    )

                                                    Spacer(modifier = Modifier.height(8.dp))

                                                    StatsCard(
                                                        title = "Unhealthy Predictions",
                                                        value = uiState.unhealthyCount.toString(),
                                                        color = Color(0xFFEF4444)
                                                    )

                                                    Spacer(modifier = Modifier.height(8.dp))

                                                    StatsCard(
                                                        title = "Total Predictions",
                                                        value = uiState.totalCount.toString(),
                                                        color = Color.White
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    Tab.FORECAST -> {
                                        if (!uiState.forecastData.isEmpty()) {
                                            ForecastChart(data = uiState.forecastData)
                                        } else {
                                            Text(
                                                text = "Loading forecast data...",
                                                color = Color.Gray,
                                                fontSize = 14.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TabItem(
    title: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Tab(
        selected = isSelected,
        onClick = onClick,
        text = {
            Text(
                text = title,
                style = KrishiTypography.labelMedium,
                textAlign = TextAlign.Center,
                color =
                    if (isSelected) Green else Color.Gray
            )
        },
        modifier = Modifier,
        selectedContentColor = Green,
        unselectedContentColor = Color.Gray,
        icon = {
            Icon(
                imageVector = icon,
                contentDescription = title
            )
        },
    )
}

@Composable
fun StatsCard(
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1A1A1A)
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            width = 1.dp,
            brush = greenBrush
        )
    ) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = title,
                color = Color.Gray,
                fontSize = 12.sp
            )
            Text(
                text = value,
                color = color,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 4.dp)
            )
        }
    }
}

//                        Button(
//                            onClick = { /* Navigate to report */ },
//                            colors = ButtonDefaults.buttonColors(
//                                containerColor = Color.Transparent,
//                                contentColor = Color.White
//                            ),
//                            modifier = Modifier.border(
//                                width = 1.dp,
//                                color = Color.Gray,
//                                shape = RoundedCornerShape(8.dp)
//                            )
//                        ) {
//                            Icon(
//                                imageVector = Icons.Default.Download,
//                                contentDescription = "Download Report",
//                                modifier = Modifier.size(18.dp)
//                            )
//                            Spacer(modifier = Modifier.padding(4.dp))
//                            Text(text = "Preview Report")
//                        }