package com.example.smart_irrigation_app.diseasedetection.components


import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFlorist
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.fastForEach
import com.example.smart_irrigation_app.diseasedetection.repository.DiseaseSample
import com.example.smart_irrigation_app.ui.theme.Green

@Composable
fun DiseaseLibraryCard(
    diseaseSamples: List<DiseaseSample>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit,
    setImage: (DiseaseSample) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF121215)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Icon(
                    Icons.Default.LocalFlorist,
                    contentDescription = "Plant Disease Library",
                    tint = Green,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Plant Disease Library",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )
            }

            // Search box
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChanged,
                placeholder = { Text("Search for a plant or disease...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedTextColor = Color.White,
                    unfocusedContainerColor = Color(0xFF1F1F23),
                    focusedContainerColor = Color(0xFF1F1F23),
                    cursorColor = Green,
                    focusedBorderColor = Green,
                    unfocusedBorderColor = Color(0xFF2A2A2E)
                ),
                trailingIcon = {
                    Icon(
                        Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color.Gray
                    )
                },
                singleLine = true,
                shape = RoundedCornerShape(8.dp)
            )

            // Disease list
            Column(
                modifier = Modifier
                    .fillMaxWidth()
            ) {
                if (diseaseSamples.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No diseases found",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray
                        )
                    }
                } else {
                    diseaseSamples.fastForEach { disease ->
                        DiseaseItem(
                            onClicked = setImage,
                            disease = disease
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DiseaseItem(disease: DiseaseSample, onClicked: (DiseaseSample) -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1A1A1D)
        ),
        onClick = { onClicked(disease) },
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Disease image
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF2A2A2E))
            ) {
                Image(
                    painter = painterResource(id = disease.imageResId),
                    contentDescription = disease.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Disease info
            Column {
                Text(
                    text = disease.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )

                Text(
                    text = disease.plant,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray,
                    modifier = Modifier.padding(vertical = 2.dp)
                )

                Text(
                    text = disease.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }
        }
    }
}

