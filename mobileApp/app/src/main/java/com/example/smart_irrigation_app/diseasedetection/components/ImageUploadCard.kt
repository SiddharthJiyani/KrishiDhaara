package com.example.smart_irrigation_app.diseasedetection.components

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.White
import android.net.Uri
import androidx.core.content.res.ResourcesCompat

@Composable
fun ImageUploadCard(
    selectedImageUri: Uri?,
    onImageSelected: (Uri?) -> Unit,
    onAnalyzeClicked: () -> Unit,
    isLoading: Boolean,
    lifecycleOwner: LifecycleOwner = LocalLifecycleOwner.current
) {
    val context = LocalContext.current
    val activity = LocalView.current.context as? Activity
    var hasCameraPermission by remember { mutableStateOf(false) }
    var showPermissionRationale by remember { mutableStateOf(false) }
    val updatedSelectedImageUri by rememberUpdatedState(newValue = selectedImageUri)


    // Gallery launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        onImageSelected(uri)
    }

    // Camera launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success: Boolean ->
        if (success) {
            onImageSelected(updatedSelectedImageUri)
            // The URI is already set before launching the camera
            // No need to update it here
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (isGranted) {
            // Permission is granted. Continue the action or workflow in your app.
            Toast.makeText(context, "Camera permission granted", Toast.LENGTH_SHORT).show()
        } else {
            // Explain to the user that the feature is unavailable because the
            // feature requires a permission that the user has denied.
            Toast.makeText(
                context,
                "Camera permission denied, enable it in your settings..",
                Toast.LENGTH_SHORT
            ).show()
            showPermissionRationale = true
        }
    }

    // Temporary URI for camera capture
    val tempImageUri = remember { mutableStateOf<Uri?>(null) }

    fun launchCamera() {
        // Create a temporary URI for the camera image
        tempImageUri.value = createTempImageUri(context)
        cameraLauncher.launch(tempImageUri.value)
        onImageSelected(tempImageUri.value)
    }
    // Check camera permission and request if needed
    LaunchedEffect(lifecycleOwner) {
        hasCameraPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }
    fun requestCameraPermission() {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            // You have the permission already, go ahead.
            launchCamera()
        } else {
            // Use the activity instance to call shouldShowRequestPermissionRationale
            val shouldShowRationale =
                activity?.shouldShowRequestPermissionRationale(Manifest.permission.CAMERA) ?: false
            if (shouldShowRationale) {
                // In an educational UI, explain to the user why your app requires this
                // permission for a specific feature to behave as expected, and what
                // features are disabled if it's declined. In this UI, include a
                // "close" or "cancel" button so the user can exit.
                Log.d("ImageUploadCard", "Explain why camera permission is needed")
                showPermissionRationale = true
                // Then request the permission
                permissionLauncher.launch(Manifest.permission.CAMERA)
            } else {
                // You can directly ask for the permission.
                // The registered ActivityResultCallback gets the result of this request.
                permissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

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
            // Upload and Camera buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { galleryLauncher.launch("image/*") },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF1F1F23)
                    )
                ) {
                    Icon(
                        Icons.Default.CloudUpload,
                        contentDescription = "Upload",
                        modifier = Modifier.size(16.dp),
                        tint = White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Upload Image")
                }

                Button(
                    onClick = {
                        // Create a temporary URI for the camera image
//                        tempImageUri.value = createTempImageUri(context)
//                        cameraLauncher.launch(tempImageUri.value)
//                        onImageSelected(tempImageUri.value)
                        if (!hasCameraPermission) {
                            requestCameraPermission()
                        } else {
                            launchCamera()
                        }
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF1F1F23)
                    )
                ) {
                    Icon(
                        Icons.Default.PhotoCamera,
                        contentDescription = "Camera",
                        modifier = Modifier.size(16.dp),
                        tint = White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Use Camera")
                }
            }

            // Image preview or drop area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .border(
                        width = 2.dp,
                        color = if (selectedImageUri != null) Color.Transparent else Color(
                            0xFF2A2A2E
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )
                    .background(Color(0xFF1A1A1D))
                    .clickable { galleryLauncher.launch("image/*") },
                contentAlignment = Alignment.Center
            ) {
                if (selectedImageUri != null) {
//                    Image(
//                        painter = rememberAsyncImagePainter(
//                            ImageRequest.Builder(context)
//                                .data(data = selectedImageUri)
//                                .build()
//                        ),
//                        contentDescription = "Selected Image",
//                        modifier = Modifier.fillMaxSize(),
//                        contentScale = ContentScale.Fit
//                    )
                    AsyncImage(
                        model = ImageRequest.Builder(context)
                            .data(selectedImageUri)
                            .crossfade(true)
                            .build(),
                        contentDescription = "Selected Image",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Fit,
                        error = painterResource(id = com.example.smart_irrigation_app.R.drawable.baseline_broken_image_24)
                    )
                } else {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Default.CloudUpload,
                            contentDescription = "Upload",
                            tint = Color.Gray,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Drag and drop an image file, or click to browse",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
            }

            // Analyze button
            Button(
                onClick = onAnalyzeClicked,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                enabled = selectedImageUri != null && !isLoading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Green,
                    disabledContainerColor = Green.copy(alpha = 0.5f)
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Analyzing...", color = Color.White)
                } else {
                    Text(text = "Analyze Plant", color = Color.Black)
                }
            }
        }
    }
}

// Helper function to create a temporary URI for camera capture
private fun createTempImageUri(context: android.content.Context): Uri {
    val tempFile = java.io.File.createTempFile(
        "camera_photo_",
        ".jpg",
        context.cacheDir
    )
    return androidx.core.content.FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        tempFile
    )
}

