package com.example.smart_irrigation_app.dashboard.presentation

import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoMode
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Insights
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.adaptive.currentWindowSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.DarkestGreen
import com.example.smart_irrigation_app.ui.theme.Green
import com.maxkeppeker.sheets.core.models.base.rememberUseCaseState
import com.maxkeppeler.sheets.calendar.CalendarDialog
import com.maxkeppeler.sheets.calendar.models.CalendarConfig
import com.maxkeppeler.sheets.calendar.models.CalendarSelection
import dev.jeziellago.compose.markdowntext.MarkdownText
import java.time.format.DateTimeFormatter

@Composable
fun StatCard(
    title: String,
    value: String,
    optimal: String,
    progress: Float,
    icon: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .wrapContentHeight(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(DarkestGreen.copy(alpha = 0.2f))
                        .padding(3.dp),
                    contentAlignment = Alignment.Center
                ) {
                    icon()
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = title,
                    color = Green,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Optimal: $optimal",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 2.dp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            LinearProgressIndicator(
                progress = { progress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Black),
                color = Green,
                gapSize = 0.dp,
                trackColor = Color.Transparent
            )

            Text(
                text = "Optimal level",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateRangePicker(
    startDate: String,
    endDate: String,
    onStartDateSelected: (String) -> Unit,
    onEndDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val calendarState = rememberUseCaseState()
    val calendarState2 = rememberUseCaseState()
    var showStartDatePicker by remember { mutableStateOf(false) }
    var showEndDatePicker by remember { mutableStateOf(false) }
    val dateFormat = remember { DateTimeFormatter.ofPattern("yyyy-MM-dd") }

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        OutlinedTextField(
            value = startDate,
            onValueChange = { },
            readOnly = true,
            label = { Text("Start Date") },
            trailingIcon = {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = "Select Start Date",
                    modifier = Modifier.clickable {
                        showStartDatePicker = true
                        calendarState.show()
                    }
                )
            },
            modifier = Modifier
                .weight(1f)
        )

        Spacer(modifier = Modifier.width(8.dp))

        OutlinedTextField(
            value = endDate,
            onValueChange = { },
            readOnly = true,
            label = { Text("End Date") },
            trailingIcon = {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = "Select End Date",
                    modifier = Modifier.clickable {
                        showEndDatePicker = true
                        calendarState2.show()
                    }
                )
            },
            modifier = Modifier
                .weight(1f)
        )
    }

    CalendarDialog(
        state = calendarState,
        selection = CalendarSelection.Date { date ->
            calendarState.hide()
            onStartDateSelected(date.format(dateFormat))
        },
        config = CalendarConfig(
            monthSelection = true, // Allows selecting months
            yearSelection = true   // Allows selecting years
        )
    )

    CalendarDialog(
        state = calendarState2,
        selection = CalendarSelection.Date { date ->
            calendarState2.hide()
            onEndDateSelected(date.format(dateFormat))
        },
        config = CalendarConfig(
            monthSelection = true, // Allows selecting months
            yearSelection = true   // Allows selecting years
        )
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisTypeSelector(
    selectedType: String,
    onTypeSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val types = listOf("daily", "monthly", "yearly")

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        types.forEach { type ->
            FilterChip(
                selected = selectedType == type,
                onClick = { onTypeSelected(type) },
                label = {
                    Text(
                        text = type.replaceFirstChar { it.uppercase() },
                        modifier = Modifier.padding(4.dp)
                    )
                },
                modifier = Modifier.weight(1f),
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = DarkestGreen
                )
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorTypeDropdown(
    selectedType: String,
    onTypeSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = if (selectedType == "humidity") "Soil Moisture" else "Temperature",
            onValueChange = { },
            readOnly = true,
            label = { Text("Sensor Type") },
            trailingIcon = {
                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
            },
            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            DropdownMenuItem(
                text = { Text("Soil Moisture") },
                onClick = {
                    onTypeSelected("humidity")
                    expanded = false
                }
            )
            DropdownMenuItem(
                text = { Text("Temperature") },
                onClick = {
                    onTypeSelected("temperature")
                    expanded = false
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SensorDropdown(
    sensors: List<String>,
    selectedSensor: String,
    onSensorSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = selectedSensor.replace("_", " ").replaceFirstChar { it.uppercase() },
            onValueChange = { },
            readOnly = true,
            label = { Text("Sensor") },
            trailingIcon = {
                ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
            },
            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
            modifier = Modifier
                .menuAnchor()
                .fillMaxWidth()
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            sensors.forEach { sensor ->
                DropdownMenuItem(
                    text = {
                        Text(
                            text = sensor.replace("_", " ").replaceFirstChar { it.uppercase() },
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    },
                    onClick = {
                        onSensorSelected(sensor)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun SensorCard(
    sensorName: String,
    status: String,
    lastReading: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DarkGrey
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = sensorName.replace("_", " ").replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Last reading: $lastReading ago",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(if (status == "on") Color.Green else Color.Red)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = if (status == "on") "ONLINE" else "OFFLINE",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun ChartCard(
    title: String,
    subtitle: String,
    chartContent: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Outlined.BarChart,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
            ) {
                chartContent()
            }
        }
    }
}

@Composable
fun LoadingIndicator() {
    val k = currentWindowSize().height.toInt()
    Box(
        modifier = Modifier
            .fillMaxSize()
            .heightIn(550.dp),
        contentAlignment = Alignment.Center
    ) {
        Log.d("Vartamaan", "LoadingIndicator: " + k)
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
fun ErrorMessage(
    message: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = message.isNotEmpty(),
        enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
        exit = fadeOut(animationSpec = tween(durationMillis = 300))
    ) {
        Surface(
            color = MaterialTheme.colorScheme.errorContainer,
            shape = RoundedCornerShape(8.dp),
            modifier = modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Error,
                    contentDescription = "Error",
                    tint = MaterialTheme.colorScheme.error
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = message,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Dismiss",
                        tint = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
    }
}

@Composable
fun InsightsButton(
    onClick: () -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        enabled = !isLoading,
        modifier = modifier,
        colors = ButtonDefaults.buttonColors(
            contentColor = Black,
            containerColor = DarkestGreen
        )
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                strokeWidth = 2.dp
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Getting insights...")
        } else {
            Icon(
                imageVector = Icons.Default.Insights,
                contentDescription = null
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "Get Insights", color = Black)
        }
    }
}

@Composable
fun InsightsCard(
    insights: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Lightbulb,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "AI Insights",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Divider()

            Spacer(modifier = Modifier.height(8.dp))
            MarkdownText(
                markdown = insights,
                style = MaterialTheme.typography.bodyLarge,
            )
        }
    }
}

@Composable
fun TabRow(
    selectedTab: String,
    onTabSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    TabRow(
        selectedTabIndex = when (selectedTab) {
            "overview" -> 0
            "sensors" -> 1
            "automation" -> 2
            else -> 0
        },
        modifier = modifier
    ) {
        Tab(
            selected = selectedTab == "overview",
            onClick = { onTabSelected("overview") },
            text = { Text("Overview") },
            icon = { Icon(Icons.Default.Dashboard, contentDescription = null) }
        )
        Tab(
            selected = selectedTab == "sensors",
            onClick = { onTabSelected("sensors") },
            text = { Text("Sensors") },
            icon = { Icon(Icons.Default.Sensors, contentDescription = null) }
        )
        Tab(
            selected = selectedTab == "automation",
            onClick = { onTabSelected("automation") },
            text = { Text("Automation") },
            icon = { Icon(Icons.Default.AutoMode, contentDescription = null) }
        )
    }
}