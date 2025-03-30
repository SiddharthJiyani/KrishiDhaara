package com.example.smart_irrigation_app.stats.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smart_irrigation_app.stats.domain.ForecastData
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

@Composable
fun ForecastChart(
    data: List<ForecastData>,
    modifier: Modifier = Modifier
) {
    var startAnimation by remember { mutableStateOf(false) }
    val animationProgress by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1000)
    )

    LaunchedEffect(key1 = data) {
        startAnimation = true
    }

    val density = LocalDensity.current

    val temperatureColor = Color(0xFFE67E22) // Orange
    val humidityColor = Color(0xFF3498DB)    // Blue

    // Get min and max values for y-axis scales
    val minTemp = data.minByOrNull { it.temperature }?.temperature?.toFloat() ?: 20f
    val maxTemp = data.maxByOrNull { it.temperature }?.temperature?.toFloat() ?: 35f
    val tempRange = (maxTemp - minTemp) * 1.1f // Add 10% padding
    val tempMin = (minTemp - tempRange * 0.05f).roundToInt().toFloat()
    val tempMax = (maxTemp + tempRange * 0.05f).roundToInt().toFloat()

    val minHumidity = data.minByOrNull { it.humidity }?.humidity?.toFloat() ?: 40f
    val maxHumidity = data.maxByOrNull { it.humidity }?.humidity?.toFloat() ?: 80f
    val humidityRange = (maxHumidity - minHumidity) * 1.1f
    val humidityMin = (minHumidity - humidityRange * 0.05f).roundToInt().toFloat()
    val humidityMax = (maxHumidity + humidityRange * 0.05f).roundToInt().toFloat()

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(300.dp)
            .padding(horizontal = 8.dp, vertical = 8.dp)
    ) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val horizontalPadding = 60f
        val verticalPadding = 50f
        val chartWidth = canvasWidth - (2 * horizontalPadding)
        val chartHeight = canvasHeight - (2 * verticalPadding)

        // Draw grid lines
        val dashPathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)

        // Horizontal grid lines for temperature
        val tempStep = ((tempMax - tempMin) / 5).roundToInt().toFloat()
        for (i in 0..5) {
            val y = verticalPadding + chartHeight - (i * chartHeight / 5)

            drawLine(
                color = Color.Gray.copy(alpha = 0.3f),
                start = Offset(horizontalPadding, y),
                end = Offset(canvasWidth - horizontalPadding, y),
                pathEffect = dashPathEffect,
                strokeWidth = 1f
            )

            val labelValue = (tempMin + i * tempStep).roundToInt().toString() + "°C"
            val textPaint = android.graphics.Paint().apply {
                color = temperatureColor.toArgb()
                textAlign = android.graphics.Paint.Align.RIGHT
                textSize = 12.sp.toPx()
            }

            drawIntoCanvas {
                it.nativeCanvas.drawText(
                    labelValue,
                    horizontalPadding - 10f,
                    y + (textPaint.textSize / 3),
                    textPaint
                )
            }
        }

        // Humidity scale on the right
        for (i in 0..5) {
            val y = verticalPadding + chartHeight - (i * chartHeight / 5)
            val labelValue =
                (humidityMin + i * ((humidityMax - humidityMin) / 5)).roundToInt().toString() + "%"
            val textPaint = android.graphics.Paint().apply {
                color = humidityColor.toArgb()
                textAlign = android.graphics.Paint.Align.LEFT
                textSize = 12.sp.toPx()
            }

            drawIntoCanvas {
                it.nativeCanvas.drawText(
                    labelValue,
                    canvasWidth - horizontalPadding + 10f,
                    y + (textPaint.textSize / 3),
                    textPaint
                )
            }
        }

        // Draw x-axis labels
        val xStep = chartWidth / (data.size - 1)

        data.forEachIndexed { index, item ->
            val x = horizontalPadding + (index * xStep)

            // Format timestamp
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
            val timeFormat = SimpleDateFormat("HH:mm", Locale.US)
            val date = try {
                // Parse the timestamp from the format in the data
                val inputFormat = SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH)
                inputFormat.parse(item.timestamp)
            } catch (e: Exception) {
                Date() // Fallback to current date if parsing fails
            }

            val timeLabel = timeFormat.format(date)

            val textPaint = android.graphics.Paint().apply {
                color = Color.Gray.toArgb()
                textAlign = android.graphics.Paint.Align.CENTER
                textSize = 12.sp.toPx()
            }

            drawIntoCanvas {
                it.nativeCanvas.drawText(
                    timeLabel,
                    x,
                    canvasHeight - verticalPadding + 20f,
                    textPaint
                )
            }
        }

        // Draw temperature line
        val temperaturePath = Path()
        data.forEachIndexed { index, item ->
            val x = horizontalPadding + (index * xStep)
            val normalizedTemp = (item.temperature - tempMin) / (tempMax - tempMin)
            val y =
                verticalPadding + chartHeight - (normalizedTemp * chartHeight * animationProgress)

            if (index == 0) {
                temperaturePath.moveTo(x, y.toFloat())
            } else {
                temperaturePath.lineTo(x, y.toFloat())
            }

            // Draw point
            drawCircle(
                color = temperatureColor,
                radius = 5f,
                center = Offset(x.toFloat(), y.toFloat())
            )
        }

        drawPath(
            path = temperaturePath,
            color = temperatureColor,
            style = Stroke(width = 3f)
        )

        // Draw humidity line
        val humidityPath = Path()
        data.forEachIndexed { index, item ->
            val x = horizontalPadding + (index * xStep)
            val normalizedHumidity = (item.humidity - humidityMin) / (humidityMax - humidityMin)
            val y =
                verticalPadding + chartHeight - (normalizedHumidity * chartHeight * animationProgress)

            if (index == 0) {
                humidityPath.moveTo(x, y.toFloat())
            } else {
                humidityPath.lineTo(x, y.toFloat())
            }

            // Draw point
            drawCircle(
                color = humidityColor,
                radius = 5f,
                center = Offset(x.toFloat(), y.toFloat())
            )
        }

        drawPath(
            path = humidityPath,
            color = humidityColor,
            style = Stroke(width = 3f)
        )
    }
}