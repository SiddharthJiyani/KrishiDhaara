package com.example.smart_irrigation_app.dashboard.presentation.automation

import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.dashboard.data.RelayState
import com.example.smart_irrigation_app.ui.theme.DarkGrey
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

data class FirebaseRelayObject(val state: String = "")

@Composable
fun AutomationScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var relays by remember { mutableStateOf<Map<String, FirebaseRelayObject>>(emptyMap()) }
    var loadingRelay by remember { mutableStateOf("") }
    val db = FirebaseDatabase.getInstance().reference.child("relay-sensors")

    LaunchedEffect(Unit) {

        db.addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val tempRelays = mutableMapOf<String, FirebaseRelayObject>()
                    for (child in snapshot.children) {
                        val key = child.key ?: continue
                        val relay = child.getValue(FirebaseRelayObject::class.java)
                        relay?.let { nonNullRelay ->
                            tempRelays[key] = nonNullRelay
                        }
                    }
                    relays = tempRelays
                }

                override fun onCancelled(error: DatabaseError) {
                    Log.e("Firebase", "Database error: ${error.message}")
                }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Manual Override",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        Text(
            text = "Configure irrigation and sensors",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            relays.forEach { id, obj ->
                item {
                    RelayCard(
                        relay = RelayState(id, obj.state),
                        isLoading = loadingRelay == id,
                        onToggle = {
                            loadingRelay = id
                            db.child(id).setValue(
                                FirebaseRelayObject(
                                    state = if (obj.state == "off") "on" else "off"
                                )
                            ).addOnSuccessListener {
                                loadingRelay = ""
                            }.addOnFailureListener {
                                loadingRelay = ""
                                Toast.makeText(context, "Error: " + it.message, Toast.LENGTH_SHORT)
                                    .show()
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun RelayCard(
    relay: RelayState,
    isLoading: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DarkGrey
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = relay.id.replace("_", " ").replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = if (relay.state == "on") "ON" else "OFF",
                        style = MaterialTheme.typography.labelMedium,
                        color = if (relay.state == "on")
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.error
                    )
                }

                Switch(
                    checked = relay.state == "on",
                    onCheckedChange = { onToggle() },
                    enabled = !isLoading
                )
            }
        }
    }
}