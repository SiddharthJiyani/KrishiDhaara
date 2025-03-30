package com.example.smart_irrigation_app.ui.theme


import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Main colors
val Green = Color(0xFF00C853)
val DarkerGreen = Color(0xFF00A744)
val DarkestGreen = Color(0xFF008C3A)
val Black = Color(0xFF000000)
val DarkGrey = Color(0xFF121212)
val DarkerGrey = Color(0xFF1A1A1A)
val White = Color(0xFFFFFFFF)

// Main Gradients
val greenBrush = Brush.horizontalGradient(
    colors = listOf(DarkestGreen, DarkerGreen, Green, DarkerGreen, DarkestGreen),
//    startX = 0.0f,
//    endX = Float.POSITIVE_INFINITY
)

// Accent colors
val Blue = Color(0xFF2196F3)
val LightBlue = Color(0xFF03A9F4)
val Teal = Color(0xFF00BFA5)
val Orange = Color(0xFFFF9800)
val Red = Color(0xFFFF5252)
val Yellow = Color(0xFFFFEB3B)

// Chart colors
val ChartGreen = Color(0xFF00E676)
val ChartBlue = Color(0xFF29B6F6)

// Status colors
val OnlineGreen = Color(0xFF4CAF50)
val OfflineRed = Color(0xFFFF5252)

// Specific component colors
val CardBackground = Color(0xFF1E1E1E)
val InputFieldBackground = Color(0xFF2C2C2C)
val ButtonBackground = Color(0xFF00C853)
val DisabledButtonBackground = Color(0xFF424242)