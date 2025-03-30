package com.example.smart_irrigation_app.weather.presentation

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.weather.presentation.components.DailyForecastItem
import com.example.smart_irrigation_app.weather.presentation.components.HourlyForecastItem
import com.example.smart_irrigation_app.weather.presentation.components.TemperatureChart2
import com.example.smart_irrigation_app.weather.presentation.components.WeatherDetailRow
import com.example.smart_irrigation_app.weather.presentation.components.WeatherInfoCard
import com.example.smart_irrigation_app.weather.presentation.viewmodel.WeatherViewModel
import java.text.SimpleDateFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WeatherScreen(
    onNavigateBack: () -> Unit,
    weatherViewModel: WeatherViewModel = viewModel()
) {
    val uiState by weatherViewModel.uiState.collectAsState()
    val searchQuery by weatherViewModel.searchQuery.collectAsState()
    val selectedDayIndex by weatherViewModel.selectedDayIndex.collectAsState()
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Location permission handling
    val locationPermissionGranted = remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }
    Log.d("Weather", "Permission granted: ${locationPermissionGranted.value.toString()}")

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        Log.d("Weather", "Permission granted: $isGranted")
        locationPermissionGranted.value = isGranted
        if (isGranted) {
            // Request location if permission granted
            getCurrentLocation(context) { location ->
                location?.let {
                    weatherViewModel.loadWeatherForecastByLocation(it)
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        // Request location permission if not granted
        if (!locationPermissionGranted.value) {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            // Get location if permission already granted
            Log.d("Weather", "WeatherScreen: getting current location")
            getCurrentLocation(context) { location ->
                location?.let {
                    Log.d("Weather", "WeatherScreen: $it")
                    weatherViewModel.loadWeatherForecastByLocation(it)
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(top = 8.dp)
    ) {
        Text(
            text = "7-day forecast to optimize your irrigation schedule",
            color = Color.Gray,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(horizontal = 8.dp)
        )

        // Search bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { weatherViewModel.onSearchQueryChanged(it) },
                placeholder = { Text("Enter location") },
                singleLine = true,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .weight(1f)
                    .padding(end = 4.dp),
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { weatherViewModel.onSearchQueryChanged("") }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear",
                                tint = Color.Gray
                            )
                        }
                    }
                }
            )

            Button(
                onClick = { weatherViewModel.onSearchSubmitted() },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.DarkGray
                ),
                modifier = Modifier.padding(start = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search"
                )
            }

            IconButton(
                onClick = {
                    // Request location permission if not granted
                    if (!locationPermissionGranted.value) {
                        locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                    } else {
                        locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
                        // Get location if permission already granted
                        Log.d("Weather", "WeatherScreen: getting current location")
                        getCurrentLocation(context) { location ->
                            location?.let {
                                Log.d("Weather", "WeatherScreen: $it")
                                weatherViewModel.loadWeatherForecastByLocation(it)
                            }
                        }
                    }
                },
                modifier = Modifier.padding(start = 4.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = "Get Current Location",
                    tint = Green
                )
            }
        }

        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color.White)
            }
        } else if (uiState.error != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = uiState.error ?: "An error occurred",
                    color = Color.Red,
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            // Weather content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(8.dp)
            ) {
                val weatherForecast = uiState.weatherForecast

                // Location and current weather info
                if (weatherForecast != null) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    ) {
                        // Location info
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Location",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = uiState.currentLocation,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        Text(
                            text = "${weatherForecast.location.latitude}, ${weatherForecast.location.longitude}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )

                        Text(
                            text = "Tuesday, Mar 25",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }

                    // Current weather card
                    WeatherInfoCard(
                        temperature = weatherForecast.current.temperature,
                        highLow = Pair(
                            weatherForecast.dailyForecasts[0].maxTemp,
                            weatherForecast.dailyForecasts[0].minTemp
                        ),
                        condition = weatherForecast.current.condition.description,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    )

                    // Weather details
                    WeatherDetailRow(
                        humidity = weatherForecast.current.humidity,
                        windSpeed = weatherForecast.current.windSpeed,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )

                    // Temperature chart
                    Text(
                        text = "Temperature (°C)",
                        style = MaterialTheme.typography.titleSmall,
                        color = Color.White,
                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                    )

                    TemperatureChart2(
                        hourlyData = uiState.hourlyTemperatureData,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )

                    // 7-day forecast
                    Text(
                        text = "7-Day Forecast",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        itemsIndexed(weatherForecast.dailyForecasts) { index, dayForecast ->
                            DailyForecastItem(
                                dayForecast = dayForecast,
                                isSelected = index == selectedDayIndex,
                                onSelected = { weatherViewModel.selectDay(index) }
                            )
                        }
                    }

                    TemperatureBarChart2(
                        data = uiState.hourlyTemperatureData,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )

                    // Hourly forecast for selected day
                    Text(
                        text = "Hourly Forecast for ${getSelectedDayName(weatherForecast.dailyForecasts[selectedDayIndex].date)}",
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                    )

                    // First 8 hours of the day
                    val selectedDayHourlyForecasts =
                        weatherForecast.dailyForecasts[selectedDayIndex].hourlyForecasts
                    val morningHours = selectedDayHourlyForecasts.filter { it.hour < 12 }
                    val afternoonHours = selectedDayHourlyForecasts.filter { it.hour >= 12 }

                    Text(
                        text = "Morning",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        weatherForecast.dailyForecasts[selectedDayIndex].hourlyForecasts.filter { it.hour < 12 }
                            .forEach {
                                item {
                                    HourlyForecastItem(
                                        hour = it,
                                        day = true
                                    )
                                }
                            }
                    }

                    Text(
                        text = "Afternoon/Evening",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        items(afternoonHours.size) { index ->
                            HourlyForecastItem(
                                day = false,
                                hour = afternoonHours[index]
                            )
                        }
                    }
                }
            }
        }
    }
}

// Helper function to get day name from date string
private fun getSelectedDayName(dateString: String): String {
    return try {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dayFormat = SimpleDateFormat("EEEE", Locale.getDefault())
        val date = dateFormat.parse(dateString)
        date?.let { dayFormat.format(it) } ?: "Today"
    } catch (e: Exception) {
        "Today"
    }
}

// Helper function to get current location
private fun getCurrentLocation(
    context: Context,
    onLocationReceived: (android.location.Location?) -> Unit
) {
    try {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        Log.e("Weather", "getCurrentLocation: location manager" + locationManager)
        // Check if we have location permissions
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            // Try to get last known location from GPS or network provider
            val gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val networkLocation =
                locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            // Use GPS location if available, otherwise fall back to network location
            val location = gpsLocation ?: networkLocation
            onLocationReceived(location)
        } else {
            onLocationReceived(null)
        }
    } catch (e: Exception) {
        Log.e("Weather", "getCurrentLocation: " + e.message)
        e.printStackTrace()
        onLocationReceived(null)
    }
}