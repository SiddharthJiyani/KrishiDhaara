package com.example.smart_irrigation_app.components

import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.smart_irrigation_app.ui.theme.Blue
import com.example.smart_irrigation_app.ui.theme.ButtonShape
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.White

// Filter chip
@Composable
fun KrishiFilterChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        shape = ButtonShape,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) Blue else DarkGrey,
            contentColor = White
        ),
        modifier = modifier
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium
        )
    }
}