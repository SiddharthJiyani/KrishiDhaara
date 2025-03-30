package com.example.smart_irrigation_app.diseasedetection

import android.content.Context
import android.net.Uri
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.smart_irrigation_app.diseasedetection.components.DiseaseLibraryCard
import com.example.smart_irrigation_app.diseasedetection.components.ImageUploadCard
import com.example.smart_irrigation_app.diseasedetection.components.ModelDetailsCard
import com.example.smart_irrigation_app.diseasedetection.components.PredictionResultCard
import com.example.smart_irrigation_app.diseasedetection.viewmodel.DiseaseDetectionUiState
import com.example.smart_irrigation_app.diseasedetection.viewmodel.DiseaseDetectionViewModel
import com.example.smart_irrigation_app.ui.theme.Green

@Composable
fun DiseaseDetectionScreen(
    onBackClick: () -> Unit,
    viewModel: DiseaseDetectionViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val selectedImageUri = viewModel.selectedImageUri.observeAsState(null)
    val diseaseSamples by viewModel.filteredDiseaseSamples.observeAsState(emptyList())
    val searchQuery by viewModel.searchQuery.observeAsState("")


    LazyColumn(
        modifier = Modifier
            .padding(4.dp)
            .animateContentSize()
    ) {
        // Title and subtitle
        item {
            Text(
                text = "Plant Disease Detection",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Green,
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .padding(bottom = 4.dp)
            )
        }

        item {
            Text(
                text = "AI-powered analysis to identify plant diseases and get treatment recommendations",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .padding(bottom = 24.dp)
            )
        }

        item {
            Column(
                modifier = Modifier
            ) {
                // Model details card
                ModelDetailsCard()

                // Image upload card
                ImageUploadCard(
                    selectedImageUri = selectedImageUri.value,
                    onImageSelected = { viewModel.setSelectedImage(it) },
                    onAnalyzeClicked = { viewModel.analyzeImage() },
                    isLoading = uiState is DiseaseDetectionUiState.Loading
                )

                // Prediction result (if available)
                if (uiState is DiseaseDetectionUiState.Success) {
                    val prediction = (uiState as DiseaseDetectionUiState.Success).prediction
                    PredictionResultCard(prediction = prediction)
                }

                // Error message (if any)
                if (uiState is DiseaseDetectionUiState.Error) {
                    val errorMessage = (uiState as DiseaseDetectionUiState.Error).message
                    Text(
                        text = "Error: $errorMessage",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Red,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                }
            }
        }
        item {
            DiseaseLibraryCard(
                diseaseSamples = diseaseSamples,
                searchQuery = searchQuery,
                onSearchQueryChanged = { viewModel.updateSearchQuery(it) },
                setImage = { disease ->
                    val drawableUri = setImageUriFromDrawable(context, disease.imageResId)
                    viewModel.setSelectedImage(drawableUri)
                }
            )
        }
    }

}

@Composable
fun setImageUriFromDrawable(drawableId: Int): Uri {
    val context = LocalContext.current
    return Uri.parse("android.resource://${context.packageName}/$drawableId")
}

fun setImageUriFromDrawable(context: Context, drawableId: Int): Uri {
    return Uri.parse("android.resource://${context.packageName}/$drawableId")
}
