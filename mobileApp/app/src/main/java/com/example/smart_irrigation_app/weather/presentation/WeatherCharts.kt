package com.example.smart_irrigation_app.weather.presentation

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smart_irrigation_app.ui.theme.DarkerGreen
import com.example.smart_irrigation_app.weather.presentation.viewmodel.HourlyTemperaturePoint
import kotlin.math.roundToInt

@Composable
fun TemperatureLineChart(
    data: List<HourlyTemperaturePoint>,
    modifier: Modifier = Modifier,
    lineColor: Color = Color(0xFF2196F3),
    fillGradient: List<Color> = listOf(Color(0x992196F3), Color(0x002196F3))
) {
    if (data.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        // Find min and max for scaling
        val minTemp = data.minOf { it.temperature }
        val maxTemp = data.maxOf { it.temperature }
        val tempRange = maxTemp - minTemp

        // Temperature range labels
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${minTemp.roundToInt()}°",
                color = Color.Gray,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "${((minTemp + maxTemp) / 2).roundToInt()}°",
                color = Color.Gray,
                fontSize = 12.sp
            )

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = "${maxTemp.roundToInt()}°",
                color = Color.Gray,
                fontSize = 12.sp
            )
        }

        // Temperature chart
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .padding(8.dp)
        ) {
            Canvas(modifier = Modifier.fillMaxWidth()) {
                val width = size.width
                val height = size.height
                val usableHeight = height * 0.8f
                val bottomPadding = height * 0.1f

                // Calculate point coordinates
                val points = data.mapIndexed { index, point ->
                    val x = width * index / (data.size - 1)
                    val normalizedTemp = if (tempRange > 0) {
                        (point.temperature - minTemp) / tempRange
                    } else {
                        0.5f // Default to middle if all temps are the same
                    }
                    val y = height - (normalizedTemp * usableHeight + bottomPadding)
                    Offset(x, y)
                }

                // Draw horizontal guide lines
                val strokeWidth = 1f
                val lineColor = Color.Gray.copy(alpha = 0.3f)

                // Draw three horizontal lines
                for (i in 1..3) {
                    val y = height * i / 4
                    drawLine(
                        color = lineColor,
                        start = Offset(0f, y),
                        end = Offset(width, y),
                        strokeWidth = strokeWidth
                    )
                }

                // Create path for temperature line
                val linePath = Path().apply {
                    points.forEachIndexed { index, offset ->
                        if (index == 0) {
                            moveTo(offset.x, offset.y)
                        } else {
                            lineTo(offset.x, offset.y)
                        }
                    }
                }

                // Create path for gradient fill
                val fillPath = Path().apply {
                    // Start at bottom left
                    moveTo(0f, height)

                    // Draw to first point
                    lineTo(points.first().x, points.first().y)

                    // Draw line through all points
                    points.drop(1).forEach { offset ->
                        lineTo(offset.x, offset.y)
                    }

                    // Draw to bottom right
                    lineTo(width, height)

                    // Close the path
                    close()
                }

                // Draw the filled area with gradient
                drawPath(
                    path = fillPath,
                    brush = Brush.verticalGradient(
                        colors = fillGradient,
                        startY = 0f,
                        endY = height
                    )
                )

                // Draw the temperature line
                drawPath(
                    path = linePath,
                    color = lineColor,
                    style = Stroke(width = 2.dp.toPx())
                )

                // Draw points for each temperature
                points.forEach { offset ->
                    drawCircle(
                        color = Color.White,
                        radius = 3.dp.toPx(),
                        center = offset
                    )
                }
            }
        }

        // Time labels
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        ) {
            val displayTimePoints = if (data.size <= 6) {
                data // Show all if few points
            } else {
                // Show subset of points
                listOf(
                    data.first(),
                    data[data.size / 4],
                    data[data.size / 2],
                    data[data.size * 3 / 4],
                    data.last()
                )
            }

            val spacerWeight = 1f / (displayTimePoints.size - 1)

            displayTimePoints.forEachIndexed { index, point ->
                if (index > 0) {
                    Spacer(modifier = Modifier.weight(spacerWeight))
                }

                Text(
                    text = point.displayTime,
                    color = Color.Gray,
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(40.dp)
                )
            }
        }
    }
}

@Composable
fun TemperatureBarChart(
    data: List<HourlyTemperaturePoint>,
    modifier: Modifier = Modifier,
    barColor: Color = DarkerGreen
) {
    if (data.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        // Find min and max for scaling
        val minTemp = data.minOf { it.temperature }
        val maxTemp = data.maxOf { it.temperature }
        val tempRange = maxTemp - minTemp

        // Chart canvas
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .padding(8.dp)
        ) {
            val width = size.width
            val height = size.height
            val barWidth = width / data.size * 0.6f
            val spaceBetween = width / data.size * 0.4f

            // Draw horizontal guide lines
            val lineColor = Color.Gray.copy(alpha = 0.3f)
            for (i in 1..3) {
                val y = height * i / 4
                drawLine(
                    color = lineColor,
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1f
                )
            }

            // Draw bars
            data.forEachIndexed { index, point ->
                val normalizedTemp = if (tempRange > 0) {
                    (point.temperature - minTemp) / tempRange
                } else {
                    0.5f
                }

                val barHeight = normalizedTemp * height
                val x = index * (barWidth + spaceBetween) + spaceBetween / 2

                drawRect(
                    color = barColor,
                    topLeft = Offset(x, height - barHeight),
                    size = androidx.compose.ui.geometry.Size(barWidth, barHeight)
                )
            }
        }

        // Time labels
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        ) {
            val displayPoints = if (data.size <= 6) {
                data
            } else {
                // Sample some points for display
                val indices = List(5) { it * (data.size - 1) / 4 }
                indices.map { data[it] }
            }

            val spacerWeight = 1f / (displayPoints.size - 1)

            displayPoints.forEachIndexed { index, point ->
                if (index > 0) {
                    Spacer(modifier = Modifier.weight(spacerWeight))
                }

                Text(
                    text = point.displayTime,
                    color = Color.Gray,
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(40.dp)
                )
            }
        }
    }
}

@Composable
fun TemperatureBarChart2(
    data: List<HourlyTemperaturePoint>,
    modifier: Modifier = Modifier,
    barColor: Color = DarkerGreen
) {
    if (data.isEmpty()) return

    Column(modifier = modifier.fillMaxWidth()) {
        val minTemp = data.minOf { it.temperature }
        val maxTemp = data.maxOf { it.temperature }
        val tempRange = maxTemp - minTemp

        // Animate the heights for each data point
        val animatedHeights = data.map { point ->
            val normalizedTemp = if (tempRange > 0) {
                (point.temperature - minTemp) / tempRange
            } else {
                0.5f
            }
            animateFloatAsState(
                targetValue = normalizedTemp,
                label = "barHeight",
                animationSpec = tween(durationMillis = 800, easing = FastOutSlowInEasing)
            ).value
        }

        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp)
                .padding(8.dp)
        ) {
            val width = size.width
            val height = size.height
            val barWidth = width / data.size * 0.6f
            val spaceBetween = width / data.size * 0.4f

            val lineColor = Color.Gray.copy(alpha = 0.3f)
            for (i in 1..3) {
                val y = height * i / 4
                drawLine(
                    color = lineColor,
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1f
                )
            }

            data.forEachIndexed { index, point ->
                val barHeight = animatedHeights[index] * height
                val x = index * (barWidth + spaceBetween) + spaceBetween / 2

                drawRect(
                    color = barColor,
                    topLeft = Offset(x, height - barHeight),
                    size = androidx.compose.ui.geometry.Size(barWidth, barHeight)
                )
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
        ) {
            val displayPoints = if (data.size <= 6) {
                data
            } else {
                val indices = List(5) { it * (data.size - 1) / 4 }
                indices.map { data[it] }
            }

            val spacerWeight = 1f / (displayPoints.size - 1)

            displayPoints.forEachIndexed { index, point ->
                if (index > 0) {
                    Spacer(modifier = Modifier.weight(spacerWeight))
                }

                Text(
                    text = point.displayTime,
                    color = Color.Gray,
                    fontSize = 10.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.width(40.dp)
                )
            }
        }
    }
}
