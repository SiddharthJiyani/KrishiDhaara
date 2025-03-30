package com.example.smart_irrigation_app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import com.google.accompanist.systemuicontroller.rememberSystemUiController

// Custom spacing dimensions
data class Spacing(
    val default: Int = 0,
    val extraSmall: Int = 4,
    val small: Int = 8,
    val medium: Int = 16,
    val large: Int = 24,
    val extraLarge: Int = 32,
    val customSectionSpacing: Int = 40
)

// CompositionLocal for custom spacing
val LocalSpacing = staticCompositionLocalOf { Spacing() }

// Dark color scheme based on Krishi Dhaara UI
private val DarkColorScheme = darkColorScheme(
    primary = Green,
    onPrimary = Black,
    secondary = Blue,
    tertiary = Teal,
    background = Black,
    surface = DarkGrey,
    onBackground = White,
    onSurface = White,
    error = Red,
    onError = White
)

@Composable
fun SmartIrrigationAppTheme(
    // Force dark theme only, ignore system setting
    content: @Composable () -> Unit
) {
    // Always use dark color scheme
    val colorScheme = DarkColorScheme

    val systemUiController = rememberSystemUiController()
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false

            // Set system bars color
            systemUiController.setSystemBarsColor(
                color = colorScheme.background,
                darkIcons = false
            )
        }
    }

    // Provide custom spacing
    CompositionLocalProvider(LocalSpacing provides Spacing()) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = KrishiTypography,
            shapes = KrishiShapes,
            content = content
        )
    }
}

// Extension property for easy access to spacing
val MaterialTheme.spacing: Spacing
    @Composable
    get() = LocalSpacing.current

//@Composable
//fun SmartIrrigationAppTheme(
//    darkTheme: Boolean = isSystemInDarkTheme(),
//    // Dynamic color is available on Android 12+
//    dynamicColor: Boolean = true,
//    content: @Composable () -> Unit
//) {
//    val colorScheme = when {
//        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
//            val context = LocalContext.current
//            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
//        }
//
//        darkTheme -> DarkColorScheme
//        else -> LightColorScheme
//    }
//
//    MaterialTheme(
//        colorScheme = colorScheme,
//        typography = Typography,
//        content = content
//    )
//}