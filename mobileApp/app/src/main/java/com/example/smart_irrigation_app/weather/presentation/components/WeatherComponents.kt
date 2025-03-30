package com.example.smart_irrigation_app.weather.presentation.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.CloudQueue
import androidx.compose.material.icons.filled.NightsStay
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.Blue
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.DarkestGreen
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.LightBlue
import com.example.smart_irrigation_app.ui.theme.OfflineRed
import com.example.smart_irrigation_app.ui.theme.White
import com.example.smart_irrigation_app.weather.domain.model.DailyForecast
import com.example.smart_irrigation_app.weather.domain.model.HourlyForecast
import com.example.smart_irrigation_app.weather.presentation.viewmodel.HourlyTemperaturePoint
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun WeatherInfoCard(
    temperature: Float,
    highLow: Pair<Float, Float>,
    condition: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = DarkGrey
        )
    ) {
        Column(
            modifier = Modifier
                .padding(8.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "${temperature.roundToInt()}°C",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontSize = 48.sp,
                    fontWeight = FontWeight.Bold
                ),
                color = Green
            )

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "H: ${highLow.first.roundToInt()}° L: ${highLow.second.roundToInt()}°",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.LightGray
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = condition,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White
            )
        }
    }
}

@Composable
fun WeatherDetailRow(
    humidity: Int,
    windSpeed: Float,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.WaterDrop,
                contentDescription = "Humidity",
                tint = LightBlue,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Humidity: ${humidity}%",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White
            )
        }

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Air,
                contentDescription = "Wind",
                tint = OfflineRed,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "Wind: ${windSpeed} km/h",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White
            )
        }
    }
}

@Composable
fun TemperatureChart(
    hourlyData: List<HourlyTemperaturePoint>,
    modifier: Modifier = Modifier
) {
    if (hourlyData.isEmpty()) return

    // Find min and max temperatures for scaling
    val minTemp = hourlyData.minOf { it.temperature }
    val maxTemp = hourlyData.maxOf { it.temperature }
    val tempRange = if (maxTemp > minTemp) maxTemp - minTemp else 1f

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(
                color = Color(0xFF1A1C1E),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(8.dp)
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .align(Alignment.Center)
        ) {
            val width = size.width
            val height = size.height
            val itemWidth = width / (hourlyData.size - 1)

            // Draw grid lines
            val stroke = Stroke(width = 1f)
            drawLine(
                color = Color(0xFF2A2C2E),
                start = Offset(0f, height * 0.25f),
                end = Offset(width, height * 0.25f),
                strokeWidth = 1f
            )
            drawLine(
                color = Color(0xFF2A2C2E),
                start = Offset(0f, height * 0.5f),
                end = Offset(width, height * 0.5f),
                strokeWidth = 1f
            )
            drawLine(
                color = Color(0xFF2A2C2E),
                start = Offset(0f, height * 0.75f),
                end = Offset(width, height * 0.75f),
                strokeWidth = 1f
            )

            // Pairs of points for the temperature line
            val points = hourlyData.mapIndexed { index, point ->
                val x = index * itemWidth
                val normalizedTemp = (point.temperature - minTemp) / tempRange
                val y = height - (normalizedTemp * height * 0.8f + height * 0.1f)
                Offset(x, y)
            }

            // Draw the temperature line
            for (i in 0 until points.size - 1) {
                drawLine(
                    color = Green,
                    start = points[i],
                    end = points[i + 1],
                    strokeWidth = 3f,
                    cap = StrokeCap.Round
                )
            }

            // Draw points at each temperature
            points.forEach { point ->
                drawCircle(
                    color = DarkestGreen,
                    radius = 4f,
                    center = point
                )
            }
        }

        // Draw time labels at the bottom
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Only show a subset of hours to avoid overcrowding
            val displayHours = hourlyData.filterIndexed { index, _ ->
                index % 4 == 0 || index == hourlyData.size - 1
            }

            displayHours.forEach { point ->
                Text(
                    text = point.displayTime,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
        }
    }
}

@Composable
fun TemperatureChart2(
    hourlyData: List<HourlyTemperaturePoint>,
    modifier: Modifier = Modifier
) {
    if (hourlyData.isEmpty()) return

    // Find min and max temperatures for scaling
    val minTemp = hourlyData.minOf { it.temperature }
    val maxTemp = hourlyData.maxOf { it.temperature }
    val tempRange = if (maxTemp > minTemp) maxTemp - minTemp else 1f

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(200.dp)
            .background(
                color = Color(0xFF1A1C1E),
                shape = RoundedCornerShape(8.dp)
            )
            .padding(8.dp)
    ) {
        // Animate the Y positions for each point
        val animatedYPositions = hourlyData.map { point ->
            val normalizedTemp = (point.temperature - minTemp) / tempRange
            val targetY = 1f - (normalizedTemp * 0.8f + 0.1f) // Invert Y-axis

            animateFloatAsState(
                targetValue = targetY,
                label = "temperatureY",
                animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing)
            ).value
        }

        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp)
                .align(Alignment.Center)
        ) {
            val width = size.width
            val height = size.height
            val itemWidth = width / (hourlyData.size - 1)

            // Draw grid lines
            val lineColor = Color(0xFF2A2C2E)
            for (i in 1..3) {
                drawLine(
                    color = lineColor,
                    start = Offset(0f, height * i / 4),
                    end = Offset(width, height * i / 4),
                    strokeWidth = 1f
                )
            }

            // Create animated points for the line chart
            val points = animatedYPositions.mapIndexed { index, animatedY ->
                Offset(index * itemWidth, height * animatedY)
            }

            // Draw the temperature line
            for (i in 0 until points.size - 1) {
                drawLine(
                    color = Green,
                    start = points[i],
                    end = points[i + 1],
                    strokeWidth = 3f,
                    cap = StrokeCap.Round
                )
            }

            // Draw points at each temperature
            points.forEach { point ->
                drawCircle(
                    color = DarkestGreen,
                    radius = 4f,
                    center = point
                )
            }
        }

        // Draw time labels at the bottom
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Show only a subset of hours for better spacing
            val displayHours = hourlyData.filterIndexed { index, _ ->
                index % 4 == 0 || index == hourlyData.size - 1
            }

            displayHours.forEach { point ->
                Text(
                    text = point.displayTime,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    modifier = Modifier.padding(horizontal = 4.dp)
                )
            }
        }
    }
}

@Composable
fun DailyForecastItem(
    dayForecast: DailyForecast,
    isSelected: Boolean,
    onSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    val dayFormat = SimpleDateFormat("EEE", Locale.getDefault())
    val dayOfWeek = try {
        val date = dateFormat.parse(dayForecast.date)
        dayFormat.format(date ?: Date())
    } catch (e: Exception) {
        dayForecast.date
    }

    val background = if (isSelected) LightBlue else Color(0xFF1A1C1E)
    val content = if (isSelected) Black else White

    Card(
        modifier = modifier
            .width(80.dp)
            .clickable(onClick = onSelected),
        colors = CardDefaults.cardColors(
            containerColor = background
        )
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = dayOfWeek,
                style = MaterialTheme.typography.bodySmall,
                color = content
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Weather icon would go here
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(Blue, RoundedCornerShape(4.dp))
            ) {
                Icon(
                    imageVector = Icons.Default.CloudQueue,
                    contentDescription = null,
                    modifier = Modifier.padding(4.dp),
                    tint = White
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${dayForecast.maxTemp.roundToInt()}°",
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = content
            )

            Text(
                text = "${dayForecast.minTemp.roundToInt()}°",
                style = MaterialTheme.typography.bodySmall,
                color = content
            )
        }
    }
}

@Composable
fun HourlyForecastItem(
    hour: HourlyForecast,
    modifier: Modifier = Modifier,
    day: Boolean
) {
    val hourFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    val timeFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
    val vector = if (day) Icons.Default.WbSunny else Icons.Default.NightsStay
    val color = if (day) Color(0xFFCD7D14) else Color(0xFF3041A8)

    val displayHour = try {
        val timeDate = timeFormat.parse(hour.time)
        hourFormat.format(timeDate ?: Date())
    } catch (e: Exception) {
        "${hour.hour}:00"
    }

    Card(
        modifier = modifier
            .width(60.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1A1C1E)
        )
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = displayHour,
                style = MaterialTheme.typography.bodySmall,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Weather icon would go here
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(color, RoundedCornerShape(4.dp))
            ) {
                Icon(
                    imageVector = vector,
                    contentDescription = null,
                    modifier = Modifier.padding(2.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "${hour.temperature.roundToInt()}°",
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = FontWeight.Bold
                ),
                color = Color.White
            )
        }
    }
}