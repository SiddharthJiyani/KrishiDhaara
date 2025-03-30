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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.ButtonShape
import com.example.smart_irrigation_app.ui.theme.CardBackground
import com.example.smart_irrigation_app.ui.theme.CardShape
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.example.smart_irrigation_app.ui.theme.DisabledButtonBackground
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.InputFieldBackground
import com.example.smart_irrigation_app.ui.theme.InputFieldShape
import com.example.smart_irrigation_app.ui.theme.OfflineRed
import com.example.smart_irrigation_app.ui.theme.White
import com.example.smart_irrigation_app.ui.theme.spacing

// Custom Dropdown
@Composable
fun <T> KrishiDropdown(
    items: List<T>,
    selectedItem: T,
    onItemSelected: (T) -> Unit,
    itemToString: (T) -> String,
    modifier: Modifier = Modifier,
    label: String? = null
) {
    var expanded by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        if (label != null) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = White.copy(alpha = 0.7f),
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        Box {
            Button(
                onClick = { expanded = true },
                colors = ButtonDefaults.buttonColors(
                    containerColor = InputFieldBackground,
                    contentColor = White
                ),
                shape = InputFieldShape,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = itemToString(selectedItem),
                        style = MaterialTheme.typography.bodyMedium,
                        color = White,
                        overflow = TextOverflow.Ellipsis
                    )
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Expand dropdown"
                    )
                }
            }

            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
                modifier = Modifier.background(DarkGrey)
            ) {
                items.forEach { item ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = itemToString(item),
                                color = White,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        },
                        onClick = {
                            onItemSelected(item)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}

// Custom TextField
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KrishiTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    isError: Boolean = false,
    errorMessage: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Done,
    singleLine: Boolean = true
) {
    Column {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = modifier,
            label = label?.let { { Text(text = it) } },
            placeholder = placeholder?.let { { Text(text = it) } },
            leadingIcon = leadingIcon,
            trailingIcon = trailingIcon,
            isError = isError,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
            singleLine = singleLine,
            shape = InputFieldShape,
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = InputFieldBackground,
                unfocusedContainerColor = InputFieldBackground,
                disabledContainerColor = InputFieldBackground.copy(alpha = 0.7f),
                focusedBorderColor = Green,
                unfocusedBorderColor = DarkGrey,
                focusedTextColor = White,
                unfocusedTextColor = White,
                focusedLabelColor = Green,
                unfocusedLabelColor = White.copy(alpha = 0.7f),
                cursorColor = Green,
            )
        )

        if (isError && errorMessage != null) {
            Text(
                text = errorMessage,
                color = OfflineRed,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(start = MaterialTheme.spacing.small.dp, top = 4.dp)
            )
        }
    }
}

// Search Field
@Composable
fun KrishiSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    onSearch: () -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search"
) {
    KrishiTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        placeholder = placeholder,
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search",
                tint = White.copy(alpha = 0.7f)
            )
        },
        trailingIcon = {
            if (value.isNotEmpty()) {
                IconButton(onClick = { onValueChange("") }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear",
                        tint = White.copy(alpha = 0.7f)
                    )
                }
            }
        },
        keyboardType = KeyboardType.Text,
        imeAction = ImeAction.Search,
        singleLine = true
    )
}
