package com.example.smart_irrigation_app.dashboard

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.smart_irrigation_app.dashboard.presentation.DashViewModel
import com.example.smart_irrigation_app.dashboard.presentation.automation.AutomationScreen
import com.example.smart_irrigation_app.dashboard.presentation.overview.OverviewScreen
import com.example.smart_irrigation_app.dashboard.presentation.sensors.SensorsScreen
import com.example.smart_irrigation_app.ui.theme.DarkerGrey
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.White
import kotlinx.coroutines.launch

// Composable Functions
@RequiresApi(Build.VERSION_CODES.O)
@Composable
fun DashHolder() {
    val dashViewModel: DashViewModel = viewModel()
    val tabs = listOf("Overview", "Sensors", "Automation")
    val pagerState = rememberPagerState { tabs.size }
    val coroutineScope = rememberCoroutineScope()
    val uiState by dashViewModel.uiState.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize(),
    ) {
        TabRow(
            selectedTabIndex = pagerState.currentPage,
            containerColor = DarkerGrey,
            indicator = { tabPositions ->
                TabRowDefaults.Indicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[pagerState.currentPage]),
                    color = Green
                )
            }
        ) {
            tabs.forEachIndexed { index, s ->
                val selected = pagerState.currentPage == index
                TextButton(
                    modifier = Modifier
                        .fillMaxWidth(),
                    onClick = {
                        if (!selected) {
                            coroutineScope.launch {
                                pagerState.animateScrollToPage(index)
                            }
                        }
                    }
                ) {
                    Text(
                        text = s,
                        textAlign = TextAlign.Center,
                        color = White,
                    )
                }
            }
        }
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) { index ->
            when (index) {
                0 -> {
                    OverviewScreen(
                        uiState = uiState,
                        onDateRangeChanged = { start, end ->
                            dashViewModel.updateDateRange(start, end)
                        },
                        onAnalysisTypeChanged = { type ->
                            dashViewModel.updateAnalysisType(type)
                        },
                        onSensorTypeChanged = { type ->
                            dashViewModel.updateSensorType(type)
                        },
                        onSensorChanged = { sensor ->
                            dashViewModel.updateSelectedSensor(sensor)
                        },
                        onGetInsights = {
                            dashViewModel.fetchInsights()
                        }
                    )
                }

                1 -> {
                    SensorsScreen(
                        sensorList = uiState.sensorList,
                        loading = uiState.loading
                    )
                }

                else -> {
                    AutomationScreen()
                }
            }
        }
    }
}
