package com.example.smart_irrigation_app.tips

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.CornerSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Landscape
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.CardShape
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.LightBlue
import com.example.smart_irrigation_app.ui.theme.OfflineRed
import com.example.smart_irrigation_app.ui.theme.Orange
import com.example.smart_irrigation_app.ui.theme.Teal
import com.example.smart_irrigation_app.ui.theme.White

val listOfGenres = listOf(
    "Watering", "Sunlight", "Soil", "Seasonal", "Climate"
)

data class Tip(
    val id: Int,
    val vector: ImageVector,
    val heading: String,
    val subheading: String,
    val points: List<String>,
    val genre: String,
    val color: Color
)

// Modify the existing TipsCard to support the new requirements
@Composable
fun TipsCard(
    tip: Tip,
    showPoints: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier,
        shape = CardShape.copy(all = CornerSize(20f)),
        colors = CardDefaults.cardColors(
            containerColor = DarkGrey
        )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Icon(
                imageVector = tip.vector,
                contentDescription = null,
                modifier = Modifier.size(35.dp),
                tint = tip.color
            )
            Spacer(Modifier.size(8.dp))
            Text(
                text = tip.heading,
                style = MaterialTheme.typography.titleLarge.copy(color = White)
            )
        }
        Text(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
                .padding(horizontal = 8.dp),
            text = tip.subheading,
            style = MaterialTheme.typography.bodyLarge.copy(color = Color(0x7EFFFFFF))
        )

        // Animated visibility for points
        AnimatedVisibility(
            visible = showPoints,
            enter = expandVertically(animationSpec = tween(300)),
            exit = shrinkVertically(animationSpec = tween(300))
        ) {
            Column {
                tip.points.forEach { str ->
                    Row(
                        modifier = Modifier
                            .padding(horizontal = 8.dp)
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(8.dp)
                                .size(5.dp)
                                .clip(CircleShape)
                                .background(tip.color)
                        )
                        Text(
                            text = str,
                            style = MaterialTheme.typography.bodySmall.copy(color = White)
                        )
                    }
                }
                Spacer(Modifier.size(8.dp))
            }
        }
    }
}

val listOfTips = listOf(
    Tip(
        id = 1,
        color = LightBlue,
        vector = Icons.Filled.WaterDrop,
        heading = "Proper Watering Techniques",
        subheading = "Learn how to water your plants effectively to promote healthy growth.",
        points = listOf(
            "Water deeply and less frequently to encourage deep root growth",
            "Water at the base of plants to avoid wetting the foliage",
            "Water in the early morning to reduce evaporation",
            "Use a moisture meter to determine when plants need water",
            "Adjust watering frequency based on season, temperature, and humidity"
        ),
        genre = "Watering"
    ),
    Tip(
        id = 2,
        color = Teal,
        vector = Icons.Filled.WbSunny,
        heading = "Optimizing Sunlight Exposure",
        subheading = "Understand the light requirements for different types of plants.",
        points = listOf(
            "Most vegetables need at least 6 hours of direct sunlight daily",
            "Rotate potted plants regularly for even growth",
            "Use shade cloth during intense summer heat",
            "South-facing windows provide the most light for indoor plants",
            "Consider supplemental grow lights for indoor plants during winter"
        ),
        genre = "Sunlight"
    ),
    Tip(
        id = 3,
        color = OfflineRed,
        vector = Icons.Filled.Landscape,
        heading = "Soil Health Management",
        subheading = "Maintain nutrient-rich soil for optimal plant growth.",
        points = listOf(
            "Test soil pH and nutrient levels annually",
            "Add organic matter like compost to improve soil structure",
            "Use mulch to conserve moisture and suppress weeds",
            "Rotate crops to prevent soil depletion",
            "Avoid compacting soil around plant roots"
        ),
        genre = "Soil"
    ),
    Tip(
        id = 4,
        color = Green,
        vector = Icons.Filled.CalendarToday,
        heading = "Seasonal Care Guidelines",
        subheading = "Adjust your gardening practices with the changing seasons.",
        points = listOf(
            "Prepare plants for winter by reducing fertilization in late summer",
            "Protect sensitive plants from frost with covers or bring them indoors",
            "Increase watering during hot summer months",
            "Prune most plants during their dormant season",
            "Apply fertilizer at the beginning of the growing season"
        ),
        genre = "Seasonal"
    ),
    Tip(
        id = 5,
        color = Orange,
        vector = Icons.Filled.Public,
        heading = "Climate Adaptation Strategies",
        subheading = "Help your plants thrive in challenging climate conditions.",
        points = listOf(
            "Group plants with similar water and light needs together",
            "Create microclimates using structures, trees, or other plants",
            "Use raised beds for better drainage in wet climates",
            "Install drip irrigation for water conservation in dry climates",
            "Choose native plants adapted to your local climate"
        ),
        genre = "Climate"
    )
)