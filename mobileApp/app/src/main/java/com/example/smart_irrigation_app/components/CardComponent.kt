package com.example.smart_irrigation_app.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.MutableTransitionState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.CardBackground
import com.example.smart_irrigation_app.ui.theme.CardShape
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.White
import com.example.smart_irrigation_app.ui.theme.spacing

@Composable
fun KrishiCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier,
        shape = CardShape,
        colors = CardDefaults.cardColors(
            containerColor = CardBackground,
        )
    ) {
        Box(
            modifier = Modifier.padding(MaterialTheme.spacing.medium.dp)
        ) {
            content()
        }
    }
}

// Reading-style component
@Composable
fun KrishiDataCard(
    title: String,
    value: String,
    unit: String? = null,
    icon: @Composable (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    infoText: String? = null,
    statusText: String? = null,
    statusColor: Color = Green
) {
    KrishiCard(modifier = modifier) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (icon != null) {
                    icon()
                }
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = White
                )
            }

            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.padding(top = MaterialTheme.spacing.medium.dp)
            ) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.displaySmall,
                    color = White
                )

                if (unit != null) {
                    Text(
                        text = unit,
                        style = MaterialTheme.typography.titleMedium,
                        color = White.copy(alpha = 0.7f),
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
            }

            if (infoText != null) {
                Text(
                    text = infoText,
                    style = MaterialTheme.typography.bodySmall,
                    color = White.copy(alpha = 0.7f),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            if (statusText != null) {
                Text(
                    text = statusText,
                    style = MaterialTheme.typography.labelMedium,
                    color = statusColor,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }
    }
}