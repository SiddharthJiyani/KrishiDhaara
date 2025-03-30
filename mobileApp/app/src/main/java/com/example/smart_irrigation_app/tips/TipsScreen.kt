package com.example.smart_irrigation_app.tips

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.Green

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TipsScreen() {
    // State to track the selected genre (null means all genres)
    var selectedGenre by remember { mutableStateOf<String>("") }

    // State to track expanded tips
    var expandedTip by remember { mutableStateOf<Int?>(null) }

    LazyColumn(
        modifier = Modifier
            .animateContentSize()
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Genre Selection Buttons
        item {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                item {
                    Button(
                        onClick = { selectedGenre = "" },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedGenre == "") Green else DarkGrey,
                            contentColor = if (selectedGenre == "") Black else Green
                        ),
                        modifier = Modifier.padding(4.dp)
                    ) {
                        Text("All")
                    }
                }
                items(listOfGenres) { genre ->
                    Button(
                        onClick = { selectedGenre = genre },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedGenre == genre) Green else DarkGrey
                        ),
                        modifier = Modifier.padding(4.dp)
                    ) {
                        Text(
                            genre,
                            color = if (selectedGenre == genre) Black else Green
                        )
                    }
                }
            }
        }
        items(listOfTips.filter {
            it.genre.contains(selectedGenre)
        }) { tip ->
            TipsCard(
                tip = tip,
                showPoints = tip.id == expandedTip,
                onClick = {
                    // Toggle tip expansion
                    expandedTip = if (expandedTip == tip.id) null else tip.id
                }
            )
        }
    }
}