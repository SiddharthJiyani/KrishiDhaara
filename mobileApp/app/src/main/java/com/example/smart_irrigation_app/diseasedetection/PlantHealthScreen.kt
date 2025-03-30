package com.example.smart_irrigation_app.diseasedetection

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.White

data class PlantDisease(
    val name: String,
    val plant: String,
    val description: String,
    val imageResId: Int
)
//
//@Composable
//fun PlantDiseaseDetectionScreen() {
//    var selectedImage by remember { mutableStateOf<File?>(null) }
//    var predictedDisease by remember { mutableStateOf<String?>(null) }
//    var searchQuery by remember { mutableStateOf("") }
//
//    val plantDiseases = listOf(
//        PlantDisease(
//            "Apple Scab",
//            "Apple",
//            "Olive-green to brown spots on leaves",
//            R.drawable.apple_scab
//        ),
//        PlantDisease(
//            "Black Rot",
//            "Apple",
//            "Circular lesions on leaves",
//            R.drawable.apple_black_rot
//        ),
//        PlantDisease("Healthy", "Apple", "No signs of disease", R.drawable.apple_healthy)
//    )
//
//    val filteredDiseases = plantDiseases.filter {
//        it.name.contains(searchQuery, ignoreCase = true) ||
//                it.plant.contains(searchQuery, ignoreCase = true)
//    }
//
//    Column(
//        modifier = Modifier
//            .fillMaxSize()
//            .background(Color.Black)
//            .padding(16.dp)
//    ) {
//        Text(
//            text = "Plant Disease Detection",
//            color = Color.White,
//            fontSize = 24.sp,
//            fontWeight = FontWeight.Bold
//        )
//        Text(
//            text = "AI-powered analysis to identify plant diseases",
//            color = Color.Gray,
//            fontSize = 14.sp
//        )
//
//        Spacer(modifier = Modifier.height(16.dp))
//
//        LazyRow(
//            modifier = Modifier.fillMaxWidth()
//        ) {
//            items(filteredDiseases) { disease ->
//                PlantDiseaseCard(disease)
//            }
//        }
//    }
//}

@Composable
fun PlantDiseaseCard(disease: PlantDisease) {
    Column(
        modifier = Modifier

            .padding(8.dp)
            .clip(shape = RoundedCornerShape(8.dp))
            .width(130.dp)

            .background(DarkGrey)
    ) {
        Image(
            painter = painterResource(id = disease.imageResId),
            contentDescription = disease.name,
            modifier = Modifier.width(130.dp),
            contentScale = ContentScale.Crop
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            disease.name,
            color = Green,
            style = MaterialTheme.typography.titleLarge,
            modifier = Modifier
                .padding(horizontal = 8.dp)
                .padding(top = 8.dp)
        )
        Text(
            disease.plant,
            color = White,
            modifier = Modifier.padding(horizontal = 8.dp),
            style = MaterialTheme.typography.titleSmall
        )
        Text(
            disease.description,
            style = MaterialTheme.typography.bodySmall,
            color = Color.LightGray,
            modifier = Modifier
                .padding(horizontal = 8.dp)
                .padding(bottom = 8.dp)
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
}
