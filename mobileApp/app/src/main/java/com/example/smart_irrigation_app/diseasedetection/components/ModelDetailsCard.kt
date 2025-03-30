package com.example.smart_irrigation_app.diseasedetection.components


import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DataThresholding
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.Green

@Composable
fun ModelDetailsCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF121215)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Analyze Plant Health",
                style = MaterialTheme.typography.titleLarge,
                color = Color.White
            )

            Text(
                text = "Upload or take a photo of your plant to detect diseases",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                FeatureItem(
                    title = "AI-Powered",
                    description = "Advanced neural networks for accurate detection",
                    icon = {
                        Icon(
                            Icons.Default.ElectricBolt,
                            contentDescription = "AI-Powered",
                            tint = Green
                        )
                    }
                )

                FeatureItem(
                    title = "Fast Results",
                    description = "Get disease identification in seconds",
                    icon = {
                        Icon(
                            Icons.Default.Speed,
                            contentDescription = "Fast Results",
                            tint = Green
                        )
                    }
                )

                FeatureItem(
                    title = "Extensive Database",
                    description = "Trained on 50,000+ plant disease images",
                    icon = {
                        Icon(
                            Icons.Default.DataThresholding,
                            contentDescription = "Extensive Database",
                            tint = Green
                        )
                    }
                )
            }
        }
    }
}

@Composable
fun FeatureItem(
    title: String,
    description: String,
    icon: @Composable () -> Unit
) {
    Column(
        modifier = Modifier.width(100.dp)
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF1A2F25))
                .padding(8.dp),
            contentAlignment = Alignment.Center
        ) {
            icon()
        }

        Text(
            text = title,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = Color.White,
            modifier = Modifier.padding(top = 8.dp)
        )

        Text(
            text = description,
            style = MaterialTheme.typography.bodySmall,
            color = Color.Gray,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

