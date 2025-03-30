package com.example.smart_irrigation_app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.smart_irrigation_app.components.KrishiNavBar
import com.example.smart_irrigation_app.components.KrishiTopAppBar
import com.example.smart_irrigation_app.navigation.Screen
import com.example.smart_irrigation_app.navigation.myBottomScreenViews
import com.example.smart_irrigation_app.navigation.myBottomScreens
import com.example.smart_irrigation_app.ui.theme.KrishiTypography
import com.example.smart_irrigation_app.ui.theme.White
import com.google.accompanist.systemuicontroller.rememberSystemUiController

@Composable
fun Master() {
    var selectedBottomNavIndex by remember { mutableIntStateOf(0) }
    var onNavigateBack by remember { mutableStateOf<(() -> Unit)?>(null) }
    val mainViewModel = viewModel<MainViewModel>()
    val navController = rememberNavController()
    val uiController = rememberSystemUiController()
    val relayState = mainViewModel.currentStateOfRelaySuggestion
    var showDropdown by remember { mutableStateOf(false) }
    var showBadge by remember { mutableStateOf(false) }
    var notificationMessage by remember { mutableStateOf<String?>(null) }

    // Check relay state and update message and badge
    LaunchedEffect(key1 = relayState.value) {
        if (relayState.value != null) {
            showBadge = true
            notificationMessage = if (relayState.value == "on") {
                "The relay is On"
            } else {
                "The relay is Off"
            }
        }
    }

    LaunchedEffect(Unit) {
        uiController.setStatusBarColor(Color.Transparent)
        uiController.setNavigationBarColor(Color.Transparent)
    }

    Scaffold(modifier = Modifier.fillMaxSize(), topBar = {
        KrishiTopAppBar(
            icon = (mainViewModel.currentScreen.value as Screen.BottomBarScreen).icon,
            title = mainViewModel.currentScreen.value.title,
            onNavigateBack = onNavigateBack,
            actions = {

                IconButton(
                    onClick = {
                        showDropdown = !showDropdown
                        //we hide badge when open menu
                        showBadge = false
                    }) {
                    BadgedBox(
                        badge = {
                            if (showBadge) {
                                Badge()
                            }
                        }) {
                        Icon(
                            Icons.Default.Notifications,
                            contentDescription = "Notifications",
                            tint = White
                        )
                    }
                }

                DropdownMenu(
                    expanded = showDropdown, onDismissRequest = { showDropdown = false }) {
                    if (notificationMessage != null) {
                        DropdownMenuItem(text = {
                            Text(
                                text = notificationMessage ?: "No Notification",
                                style = KrishiTypography.bodyMedium
                            )
                        }, onClick = { showDropdown = false })
                    }
                }
            })
    }, bottomBar = {
        KrishiNavBar(
            selectedItem = selectedBottomNavIndex,
            onItemSelected = { tappedIndex, tappedScreen ->
                if (selectedBottomNavIndex != tappedIndex) {
                    selectedBottomNavIndex = tappedIndex
                    navController.navigate(tappedScreen.route) {
                        popUpTo(navController.graph.startDestinationId) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            })
    }) { padVal ->
        NavHost(
            navController = navController,
            startDestination = mainViewModel.currentScreen.value.route,
            modifier = Modifier.padding(padVal)
        ) {
            myBottomScreens.forEachIndexed { index, screen ->
                composable(screen.route) {
                    mainViewModel.setCurrentScreen(screen)
                    if (mainViewModel.currentScreen.value != Screen.BottomBarScreen.Dashboard) {
                        onNavigateBack = {
                            navController.navigate(Screen.BottomBarScreen.Dashboard.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    } else {
                        onNavigateBack = null
                    }
                    myBottomScreenViews[index]()
                }
            }
        }
    }
}
