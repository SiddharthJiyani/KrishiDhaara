package com.example.smart_irrigation_app.diseasedetection.viewmodel


import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.smart_irrigation_app.diseasedetection.api.PredictionResponse
import com.example.smart_irrigation_app.diseasedetection.repository.DiseaseRepository
import com.example.smart_irrigation_app.diseasedetection.repository.DiseaseSample
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the disease detection feature
 */
class DiseaseDetectionViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = DiseaseRepository(application)

    // UI state
    private val _uiState =
        MutableStateFlow<DiseaseDetectionUiState>(DiseaseDetectionUiState.Initial)
    val uiState: StateFlow<DiseaseDetectionUiState> = _uiState.asStateFlow()

    // Selected image
    private val _selectedImageUri = MutableLiveData<Uri?>()
    val selectedImageUri: LiveData<Uri?> = _selectedImageUri

    // Disease library
    private val _diseaseSamples = MutableLiveData<List<DiseaseSample>>()
    val diseaseSamples: LiveData<List<DiseaseSample>> = _diseaseSamples

    // Filtered disease samples for search
    private val _filteredDiseaseSamples = MutableLiveData<List<DiseaseSample>>()
    val filteredDiseaseSamples: LiveData<List<DiseaseSample>> = _filteredDiseaseSamples

    // Search query
    private val _searchQuery = MutableLiveData<String>("")
    val searchQuery: LiveData<String> = _searchQuery

    init {
        loadDiseaseSamples()
    }

    /**
     * Sets the selected image URI
     * @param uri URI of the selected image
     */
    fun setSelectedImage(uri: Uri?) {
        _selectedImageUri.value = uri
    }

    /**
     * Loads the disease samples from the repository
     */
    private fun loadDiseaseSamples() {
        val samples = repository.getDiseaseSamples()
        _diseaseSamples.value = samples
        _filteredDiseaseSamples.value = samples
    }

    /**
     * Updates the search query and filters the disease samples
     * @param query Search query
     */
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        filterDiseaseSamples(query)
    }

    /**
     * Filters the disease samples based on the search query
     * @param query Search query
     */
    private fun filterDiseaseSamples(query: String) {
        if (query.isBlank()) {
            _filteredDiseaseSamples.value = _diseaseSamples.value
            return
        }

        val filteredList = _diseaseSamples.value?.filter {
            it.name.contains(query, ignoreCase = true) ||
                    it.plant.contains(query, ignoreCase = true)
        }

        _filteredDiseaseSamples.value = filteredList ?: emptyList()
    }

    /**
     * Analyzes the selected image for disease detection
     */
    fun analyzeImage() {
        val imageUri = _selectedImageUri.value ?: return

        _uiState.value = DiseaseDetectionUiState.Loading

        viewModelScope.launch {
            val result = repository.predictDisease(imageUri)

            _uiState.value = if (result.isSuccess) {
                DiseaseDetectionUiState.Success(result.getOrNull()!!)
            } else {
                DiseaseDetectionUiState.Error(result.exceptionOrNull()?.message ?: "Unknown error")
            }
        }
    }

    /**
     * Resets the UI state to initial
     */
    fun resetState() {
        _uiState.value = DiseaseDetectionUiState.Initial
        _selectedImageUri.value = null
    }
}

/**
 * Sealed class to represent the UI state of the disease detection screen
 */
sealed class DiseaseDetectionUiState {
    object Initial : DiseaseDetectionUiState()
    object Loading : DiseaseDetectionUiState()
    data class Success(val prediction: PredictionResponse) : DiseaseDetectionUiState()
    data class Error(val message: String) : DiseaseDetectionUiState()
}

