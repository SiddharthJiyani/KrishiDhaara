package com.example.smart_irrigation_app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val googleFontFamily = FontFamily(
    Font(com.example.smart_irrigation_app.R.font.googlebold, FontWeight.Bold),
    Font(com.example.smart_irrigation_app.R.font.googlebold, FontWeight.Black),
    Font(com.example.smart_irrigation_app.R.font.googlemedium, FontWeight.Normal),
    Font(com.example.smart_irrigation_app.R.font.googlemedium, FontWeight.Medium),
    Font(com.example.smart_irrigation_app.R.font.googlethin, FontWeight.Light),
    Font(com.example.smart_irrigation_app.R.font.googlethin, FontWeight.Thin),
)

val KrishiTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp,
        lineHeight = 56.sp,
        letterSpacing = (-0.25).sp,
        color = White
    ),
    displayMedium = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 38.sp,
        lineHeight = 46.sp,
        color = White
    ),
    displaySmall = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        lineHeight = 38.sp,
        color = White
    ),
    headlineLarge = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        color = White
    ),
    headlineMedium = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        color = White
    ),
    headlineSmall = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 28.sp,
        color = White
    ),
    titleLarge = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
        color = White
    ),
    titleMedium = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        letterSpacing = 0.1.sp,
        color = White
    ),
    titleSmall = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.1.sp,
        color = White
    ),
    bodyLarge = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.5.sp,
        color = White
    ),
    bodyMedium = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.25.sp,
        color = White
    ),
    bodySmall = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Thin,
        fontSize = 14.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.4.sp,
        color = White
    ),
    labelLarge = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 18.sp,
        letterSpacing = 0.1.sp,
        color = White
    ),
    labelMedium = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp,
        color = White
    ),
    labelSmall = TextStyle(
        fontFamily = googleFontFamily, //FontFamily.Default,
        fontWeight = FontWeight.Thin,
        fontSize = 9.sp,
        lineHeight = 14.sp,
        letterSpacing = 0.5.sp,
        color = White
    )
)
