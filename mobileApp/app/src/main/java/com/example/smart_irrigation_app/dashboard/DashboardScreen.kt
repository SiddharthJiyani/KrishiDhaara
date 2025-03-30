package com.example.smart_irrigation_app.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.components.FadeInSlideInContent
import com.example.smart_irrigation_app.components.KrishiDataCard
import com.example.smart_irrigation_app.components.KrishiHeading
import com.example.smart_irrigation_app.components.KrishiProgressBar
import com.example.smart_irrigation_app.components.KrishiSubheading
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.spacing

@Composable
fun DashboardScreen() {

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 8.dp)
    ) {
        item() {
            FadeInSlideInContent(content = {
                KrishiHeading(
                    text = "Krishi Dhaara Dashboard",
                    modifier = Modifier.padding(top = 16.dp)
                )
            })
        }
        item() {
            FadeInSlideInContent(delayMillis = 100, content = {
                KrishiSubheading(
                    text = "Monitor and control your smart irrigation system with real-time insights",
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            })
        }
        item() {
            Spacer(modifier = Modifier.height(MaterialTheme.spacing.large.dp))
        }
        item() {
            FadeInSlideInContent(delayMillis = 300, content = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    KrishiDataCard(
                        title = "Soil Moisture",
                        value = "33.17",
                        icon = {
                            Icon(
                                imageVector = Icons.Default.WaterDrop,
                                contentDescription = "Soil Moisture",
                                tint = Green
                            )
                        },
                        infoText = "Optimal: 40-60%",
                        modifier = Modifier.weight(1f)
                    )

                    KrishiDataCard(
                        title = "Temperature",
                        value = "27.23",
                        unit = "°C",
                        icon = {
                            Icon(
                                imageVector = Icons.Default.Thermostat,
                                contentDescription = "Temperature",
                                tint = Green
                            )
                        },
                        infoText = "Optimal: 18-26°C",
                        modifier = Modifier.weight(1f)
                    )
                }
            })
        }
        item() {
            Spacer(modifier = Modifier.height(MaterialTheme.spacing.medium.dp))
        }
        item() {
            FadeInSlideInContent(delayMillis = 400, content = {
                Column {
                    KrishiHeading(
                        text = "Soil Moisture Level",
                        modifier = Modifier.padding(vertical = MaterialTheme.spacing.small.dp)
                    )

                    KrishiProgressBar(
                        progress = 0.33f,
                        modifier = Modifier.padding(vertical = MaterialTheme.spacing.small.dp)
                    )

                    KrishiSubheading(
                        text = "Optimal level",
                        modifier = Modifier.padding(bottom = MaterialTheme.spacing.medium.dp)
                    )
                }
            })
        }
    }
}
