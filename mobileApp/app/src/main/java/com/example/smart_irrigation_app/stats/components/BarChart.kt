package com.example.smart_irrigation_app.stats.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smart_irrigation_app.stats.domain.MonthlyData
import kotlin.math.roundToInt

@Composable
fun BarChart(
    data: List<MonthlyData>,
    modifier: Modifier = Modifier
) {
    var startAnimation by remember { mutableStateOf(false) }
    val alphaAnim by animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1000)
    )

    LaunchedEffect(key1 = true) {
        startAnimation = true
    }

    val barColor = Color(0xFF3B82F6) // The blue color from the screenshot
    val maxValue = data.maxByOrNull { it.value }?.value?.toFloat() ?: 0f
    val barWidth = 30f
    val horizontalPadding = 40f
    val verticalPadding = 80f
    val chartHeight = 250f

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(400.dp)
            .padding(horizontal = 8.dp, vertical = 8.dp)
    ) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val chartWidth = canvasWidth - (2 * horizontalPadding)
        val barSpacing = chartWidth / data.size

        // Draw vertical axis lines and labels
        val paint = android.graphics.Paint().apply {
            color = Color.Gray.toArgb()
            textAlign = android.graphics.Paint.Align.RIGHT
            textSize = 12.sp.toPx()
        }

        val yAxisStep = 50
        val numSteps = (maxValue / yAxisStep).roundToInt() + 1

        for (i in 0..numSteps) {
            val y = canvasHeight - verticalPadding - (i * (chartHeight / numSteps))
            drawLine(
                color = Color.Gray.copy(alpha = 0.3f),
                start = Offset(horizontalPadding, y),
                end = Offset(canvasWidth - horizontalPadding, y),
                strokeWidth = 1f
            )

            val labelValue = (i * yAxisStep).toString()
            drawIntoCanvas {
                it.nativeCanvas.drawText(
                    labelValue,
                    horizontalPadding - 10f,
                    y + (paint.textSize / 3),
                    paint
                )
            }
        }

        // Draw bars with animation
        data.forEachIndexed { index, item ->
            val barHeight = (item.value / maxValue) * chartHeight * alphaAnim
            val x = horizontalPadding + (index * barSpacing) + (barSpacing / 2) - (barWidth / 2)
            val y = canvasHeight - verticalPadding - barHeight

            // Draw bar
            drawRect(
                color = barColor,
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight)
            )

            // Draw x-axis label
            val textPaint = android.graphics.Paint().apply {
                color = Color.Gray.toArgb()
                textAlign = android.graphics.Paint.Align.CENTER
                textSize = 10.sp.toPx()
            }

            drawIntoCanvas {
                it.nativeCanvas.drawText(
                    item.month,
                    x + (barWidth / 2),
                    canvasHeight - verticalPadding + 20f,
                    textPaint
                )
            }
        }
    }
}