package com.example.smart_irrigation_app.diseasedetection.repository


import android.content.Context
import android.net.Uri
import com.example.smart_irrigation_app.diseasedetection.api.PlantHealthApiClient
import com.example.smart_irrigation_app.diseasedetection.api.PredictionResponse
import com.example.smart_irrigation_app.diseasedetection.util.FileUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody

class DiseaseRepository(private val context: Context) {

    /**
     * Sends an image to the API for disease prediction
     * @param imageUri URI of the image to be analyzed
     * @return PredictionResponse containing the predicted disease and cure
     */
    suspend fun predictDisease(imageUri: Uri): Result<PredictionResponse> =
        withContext(Dispatchers.IO) {
            try {
                // Convert URI to File
                val file = FileUtil.getFileFromUri(context, imageUri)
                    ?: return@withContext Result.failure(Exception("Failed to process image"))

                // Create multipart request
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

                // Make API call
                val response = PlantHealthApiClient.apiService.predictDisease(body)

                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("API call failed with code: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    /**
     * Returns a list of sample plant diseases for the disease library
     */
    fun getDiseaseSamples(): List<DiseaseSample> {
        return listOf(
            DiseaseSample(
                id = "apple-scab",
                name = "Apple Scab",
                plant = "Apple",
                description = "Olive-green to brown spots on leaves and fruit. Infected leaves may drop prematurely.",
                imageResId = com.example.smart_irrigation_app.R.drawable.apple___apple_scab
            ),
            DiseaseSample(
                id = "apple-black-rot",
                name = "Black Rot",
                plant = "Apple",
                description = "Circular lesions on leaves with purple margins and brown centers.",
                imageResId = com.example.smart_irrigation_app.R.drawable.apple___black_rot
            ),
            DiseaseSample(
                id = "cedar-apple-rust",
                name = "Cedar Apple Rust",
                plant = "Apple",
                description = "Orange spots on leaves and fruit with small black dots in the center.",
                imageResId = com.example.smart_irrigation_app.R.drawable.apple___cedar_apple_rust
            ),
            DiseaseSample(
                id = "apple-healthy",
                name = "Healthy",
                plant = "Apple",
                description = "Healthy apple leaves and fruit with no signs of disease.",
                imageResId = com.example.smart_irrigation_app.R.drawable.apple___healthy
            ),
            DiseaseSample(
                id = "blueberry-healthy",
                name = "Healthy",
                plant = "Blueberry",
                description = "Healthy blueberry leaves and fruit with no signs of disease.",
                imageResId = com.example.smart_irrigation_app.R.drawable.blueberry___healthy
            ),
            DiseaseSample(
                id = "cherry-healthy",
                name = "Healthy",
                plant = "Cherry",
                description = "Healthy cherry leaves and fruit with no signs of disease.",
                imageResId = com.example.smart_irrigation_app.R.drawable.cherry____healthy
            ),
            DiseaseSample(
                id = "cherry-powdery-mildew",
                name = "Powdery Mildew",
                plant = "Cherry",
                description = "White powdery growth on leaves and fruit. Can lead to distorted growth.",
                imageResId = com.example.smart_irrigation_app.R.drawable.cherry____powdery_mildew
            ),
            DiseaseSample(
                id = "corn-common-rust",
                name = "Common Rust",
                plant = "Corn",
                description = "Brown, circular lesions on the leaves, often with yellow halos.",
                imageResId = com.example.smart_irrigation_app.R.drawable.corn____common_rust_
            ),
            DiseaseSample(
                id = "corn-northern-leaf-blight",
                name = "Northern Leaf Blight",
                plant = "Corn",
                description = "Long, grayish-green lesions on the leaves with dark edges.",
                imageResId = com.example.smart_irrigation_app.R.drawable.corn____northern_leaf_blight
            ),
            DiseaseSample(
                id = "grape-black-rot",
                name = "Black Rot",
                plant = "Grape",
                description = "Dark brown or black lesions on leaves and fruit, leading to fruit shriveling.",
                imageResId = com.example.smart_irrigation_app.R.drawable.grape___black_rot
            ),
            DiseaseSample(
                id = "orange-haunglongbing",
                name = "Haunglongbing (Citrus Greening)",
                plant = "Orange",
                description = "Yellowing of leaves and fruit, poor fruit quality.",
                imageResId = com.example.smart_irrigation_app.R.drawable.orange___haunglongbing
            ),
            DiseaseSample(
                id = "peach-healthy",
                name = "Healthy",
                plant = "Peach",
                description = "Healthy peach leaves and fruit with no signs of disease.",
                imageResId = com.example.smart_irrigation_app.R.drawable.peach___healthy
            ),
            DiseaseSample(
                id = "raspberry-healthy",
                name = "Healthy",
                plant = "Raspberry",
                description = "Healthy raspberry leaves and fruit with no signs of disease.",
                imageResId = com.example.smart_irrigation_app.R.drawable.raspberry___healthy
            )
        )
    }
}

data class DiseaseSample(
    val id: String,
    val name: String,
    val plant: String,
    val description: String,
    val imageResId: Int
)

