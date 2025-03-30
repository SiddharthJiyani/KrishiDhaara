package com.example.smart_irrigation_app.stats.components

import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.stats.domain.HealthData

@Composable
fun DoughnutChart(
    data: List<HealthData>,
    modifier: Modifier = Modifier
) {
    var startAnimation by remember { mutableStateOf(false) }
    var sweepAngles = remember { List(data.size) { 0f } }
    val animatedSweepAngles = data.map { healthData ->
        val targetAngle = (healthData.value / 100f) * 360f
        val animatedValue by animateFloatAsState(
            targetValue = if (startAnimation) (targetAngle.toFloat()) else 0f,
            animationSpec = tween(
                durationMillis = 1000,
                easing = LinearOutSlowInEasing
            )
        )
        animatedValue
    }

    LaunchedEffect(key1 = data) {
        startAnimation = true
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(300.dp)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(
            modifier = Modifier
                .size(250.dp)
        ) {
            val width = size.width
            val height = size.height
            val thickness = width / 7f
            val radius = (minOf(width, height) / 2f) - (thickness / 2f)

            var startAngle = -90f // Start from top (12 o'clock position)

            data.forEachIndexed { index, item ->
                val color = Color(android.graphics.Color.parseColor(item.color))
                val sweepAngle = animatedSweepAngles[index]

                drawArc(
                    color = color,
                    startAngle = startAngle,
                    sweepAngle = sweepAngle,
                    useCenter = false,
                    style = Stroke(
                        width = thickness,
                        cap = StrokeCap.Butt
                    )
                )

                startAngle += sweepAngle
            }
        }
    }
}