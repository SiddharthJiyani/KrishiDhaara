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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.bottombar.AnimatedBottomBar
import com.example.bottombar.components.BottomBarItem
import com.example.bottombar.model.IndicatorStyle
import com.example.bottombar.model.ItemStyle
import com.example.bottombar.model.VisibleItem
import com.example.smart_irrigation_app.navigation.Screen
import com.example.smart_irrigation_app.navigation.myBottomScreens
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.ButtonBackground
import com.example.smart_irrigation_app.ui.theme.ButtonShape
import com.example.smart_irrigation_app.ui.theme.CardBackground
import com.example.smart_irrigation_app.ui.theme.CardShape
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.DarkerGrey
import com.example.smart_irrigation_app.ui.theme.DarkestGreen
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.Red
import com.example.smart_irrigation_app.ui.theme.White
import com.example.smart_irrigation_app.ui.theme.greenBrush
import com.example.smart_irrigation_app.ui.theme.spacing

@Composable
fun KrishiNavBar(
    selectedItem: Int,
    onItemSelected: (Int, Screen) -> Unit
) {
    val bg = greenBrush
    Column(
        modifier = Modifier
            //.background(bg)
            .fillMaxWidth()
            .wrapContentHeight()
    ) {
        AnimatedBottomBar(
            modifier = Modifier
                .navigationBarsPadding()
                .padding(horizontal = 16.dp)
                .background(bg, shape = RoundedCornerShape(50))
                .padding(bottom = 4.dp)
                ,
            selectedItem = selectedItem,
            itemSize = myBottomScreens.size,
            containerColor = Color.Transparent,
            indicatorStyle = IndicatorStyle.WORM,
            indicatorColor = Black,
            contentColor = Color.Transparent,
        ) {
            myBottomScreens.forEachIndexed { index, screen ->
                BottomBarItem(
                    selected = index == selectedItem,
                    imageVector = ImageVector.vectorResource(id = screen.icon),
                    label = screen.title,
                    containerColor = Color.Transparent,
                    inactiveIndicatorColor = Black,
                    activeIndicatorColor = Black,
                    iconColor = Black,
                    textColor = Black,
                    contentColor = Black,
                    visibleItem = VisibleItem.BOTH,
                    itemStyle = ItemStyle.STYLE4,
                    onClick = {
                        onItemSelected(index, screen)
                    }
                )
            }
        }
    }
}
