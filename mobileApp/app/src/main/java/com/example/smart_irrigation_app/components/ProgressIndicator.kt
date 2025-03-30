package com.example.smart_irrigation_app.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.Green

// Progress indicator
@Composable
fun KrishiProgressBar(
    progress: Float,
    modifier: Modifier = Modifier,
    backgroundColor: Color = DarkGrey,
    progressColor: Color = Green,
    height: Int = 8
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(height.dp)
            .clip(CircleShape)
            .background(backgroundColor)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .height(height.dp)
                .clip(CircleShape)
                .background(progressColor)
        )
    }
}


