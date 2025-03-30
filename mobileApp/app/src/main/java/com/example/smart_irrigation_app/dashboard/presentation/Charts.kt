package com.example.smart_irrigation_app.dashboard.presentation

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.dashboard.data.MinMaxDataPoint
import com.example.smart_irrigation_app.dashboard.data.ProcessedDataPoint

@Composable
fun AreaChart(
    data: List<ProcessedDataPoint>,
    bodyColor: Color,
    backgroundColor: Color,
    modifier: Modifier = Modifier
) {
    // Only proceed if we have data
    if (data.isEmpty()) return

    // Create animatable values for smooth transitions
    val animatedData = data.map {
        remember(it) {
            Animatable(it.value)
        }
    }

    // Animate data changes
    LaunchedEffect(data) {
        data.forEachIndexed { index, dataPoint ->
            animatedData[index].animateTo(
                targetValue = dataPoint.value,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioLowBouncy,
                    stiffness = Spring.StiffnessLow
                )
            )
        }
    }

    Box(
        modifier = modifier
            .background(Color.Transparent)
            .padding(top = 8.dp, bottom = 4.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val horizontalStep = width / (animatedData.size - 1).coerceAtLeast(1)

            // Find the maximum value for scaling
            val maxValue = animatedData.maxOfOrNull { it.value } ?: 0f
            // Add some padding to the max value to avoid drawing at the very top edge
            val scaledMaxValue = (maxValue * 1.1f).coerceAtLeast(0.1f)

            // Draw horizontal grid lines
            val gridLineCount = 4
            val gridStep = height / gridLineCount

            for (i in 0..gridLineCount) {
                val y = height - (i * gridStep)
                drawLine(
                    color = Color.Gray.copy(alpha = 0.3f),
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 4f), 0f)
                )
            }

            // Draw line chart with area fill
            val path = Path()
            val fillPath = Path()

            // Start paths from the first data point
            val firstX = 0f
            val firstY = height - (animatedData[0].value / scaledMaxValue * height)

            path.moveTo(firstX, firstY)
            fillPath.moveTo(firstX, height) // Start from bottom
            fillPath.lineTo(firstX, firstY) // Go up to first data point

            // Draw line through all data points
            for (i in 1 until animatedData.size) {
                val x = i * horizontalStep
                val y = height - (animatedData[i].value / scaledMaxValue * height)
                path.lineTo(x, y)
                fillPath.lineTo(x, y)
            }

            // Complete the fill path by going back to the bottom
            fillPath.lineTo(width, height)
            fillPath.close()

            // Draw the fill
            drawPath(
                path = fillPath,
                color = backgroundColor
            )

            // Draw the line
            drawPath(
                path = path,
                color = bodyColor,
                style = Stroke(
                    width = 2f,
                    cap = StrokeCap.Round
                )
            )

            // Draw data points
            for (i in animatedData.indices) {
                val x = i * horizontalStep
                val y = height - (animatedData[i].value / scaledMaxValue * height)

                // Outer circle (highlight)
                drawCircle(
                    color = bodyColor,
                    radius = 4f,
                    center = Offset(x, y)
                )

                // Inner circle
                drawCircle(
                    color = Color.Black,
                    radius = 2f,
                    center = Offset(x, y)
                )
            }
        }

        // Draw x-axis labels if needed
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            data.forEachIndexed { index, point ->
                if (index == 0 || index == data.size / 2 || index == data.size - 1) {
                    Text(
                        text = point.time,
                        style = MaterialTheme.typography.caption,
                        color = Color.White.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    )
                } else {
                    Spacer(modifier = Modifier.width(4.dp))
                }
            }
        }
    }
}

@Composable
fun MultiLineChart(
    data: List<MinMaxDataPoint>,
    modifier: Modifier = Modifier
) {
    // Only proceed if we have data
    if (data.isEmpty()) return

    // Define colors for max and min lines
    val maxColor = Color(0xFF1E88E5) // Blue for max
    val minColor = Color(0xFFE57373) // Red for min

    // Create animatable values for smooth transitions
    val animatedMaxData = data.map {
        remember(it) {
            Animatable(it.max)
        }
    }
    val animatedMinData = data.map {
        remember(it) {
            Animatable(it.min)
        }
    }

    // Animate data changes
    LaunchedEffect(data) {
        data.forEachIndexed { index, dataPoint ->
            animatedMaxData[index].animateTo(
                targetValue = dataPoint.max,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioLowBouncy,
                    stiffness = Spring.StiffnessLow
                )
            )
            animatedMinData[index].animateTo(
                targetValue = dataPoint.min,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioLowBouncy,
                    stiffness = Spring.StiffnessLow
                )
            )
        }
    }

    Box(
        modifier = modifier
            .background(Color.Transparent)
            .padding(top = 8.dp, bottom = 4.dp)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val horizontalStep = width / (animatedMaxData.size - 1).coerceAtLeast(1)

            // Find the overall max and min for scaling
            val allMaxValues = animatedMaxData.map { it.value }
            val allMinValues = animatedMinData.map { it.value }
            val maxValue = allMaxValues.maxOrNull() ?: 0f
            val minValue = allMinValues.minOrNull() ?: 0f

            // Add padding to avoid drawing at the edges
            val range = (maxValue - minValue) * 1.2f
            val adjustedMin = minValue - (range * 0.1f)
            val adjustedMax = maxValue + (range * 0.1f)

            // Function to convert data value to Y coordinate
            val getYCoordinate = { value: Float ->
                val normalized = (value - adjustedMin) / (adjustedMax - adjustedMin)
                height - (normalized * height)
            }

            // Draw horizontal grid lines
            val gridLineCount = 4
            val gridStep = height / gridLineCount

            for (i in 0..gridLineCount) {
                val y = i * gridStep
                drawLine(
                    color = Color.Gray.copy(alpha = 0.3f),
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 4f), 0f)
                )
            }

            // Draw max line
            val maxPath = Path()
            maxPath.moveTo(0f, getYCoordinate(animatedMaxData[0].value))

            for (i in 1 until animatedMaxData.size) {
                val x = i * horizontalStep
                val y = getYCoordinate(animatedMaxData[i].value)
                maxPath.lineTo(x, y)
            }

            drawPath(
                path = maxPath,
                color = maxColor,
                style = Stroke(
                    width = 2f,
                    cap = StrokeCap.Round
                )
            )

            // Draw min line
            val minPath = Path()
            minPath.moveTo(0f, getYCoordinate(animatedMinData[0].value))

            for (i in 1 until animatedMinData.size) {
                val x = i * horizontalStep
                val y = getYCoordinate(animatedMinData[i].value)
                minPath.lineTo(x, y)
            }

            drawPath(
                path = minPath,
                color = minColor,
                style = Stroke(
                    width = 2f,
                    cap = StrokeCap.Round
                )
            )

            // Draw data points for max line
            for (i in animatedMaxData.indices) {
                val x = i * horizontalStep
                val y = getYCoordinate(animatedMaxData[i].value)

                drawCircle(
                    color = maxColor,
                    radius = 4f,
                    center = Offset(x, y)
                )

                drawCircle(
                    color = Color.Black,
                    radius = 2f,
                    center = Offset(x, y)
                )
            }

            // Draw data points for min line
            for (i in animatedMinData.indices) {
                val x = i * horizontalStep
                val y = getYCoordinate(animatedMinData[i].value)

                drawCircle(
                    color = minColor,
                    radius = 4f,
                    center = Offset(x, y)
                )

                drawCircle(
                    color = Color.Black,
                    radius = 2f,
                    center = Offset(x, y)
                )
            }
        }

        // Draw x-axis labels if needed
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            data.forEachIndexed { index, point ->
                if (index == 0 || index == data.size / 2 || index == data.size - 1) {
                    Text(
                        text = point.time,
                        style = MaterialTheme.typography.caption,
                        color = Color.White.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    )
                } else {
                    Spacer(modifier = Modifier.width(4.dp))
                }
            }
        }

        // Draw legend
        Row(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Max legend item
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(maxColor)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Max",
                    style = MaterialTheme.typography.caption,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Min legend item
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(minColor)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Min",
                    style = MaterialTheme.typography.caption,
                    color = Color.White.copy(alpha = 0.7f)
                )
            }
        }
    }
}