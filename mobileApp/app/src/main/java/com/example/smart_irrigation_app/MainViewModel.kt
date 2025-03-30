package com.example.smart_irrigation_app

import android.util.Log
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.example.smart_irrigation_app.navigation.Screen
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

class MainViewModel : ViewModel() {
    private val _currentScreen = mutableStateOf<Screen>(Screen.BottomBarScreen.Dashboard)
    val currentScreen: MutableState<Screen> = _currentScreen

    val ref =
        FirebaseDatabase.getInstance().reference.child("relay-sensors-suggestion").child("relay1")
    private val _currentStateOfRelaySuggestion = mutableStateOf<String?>(null)
    val currentStateOfRelaySuggestion: MutableState<String?> = _currentStateOfRelaySuggestion

    init {
        Log.d("Notification", "onDataChange: trying to add onValueEventListener")
        ref.addValueEventListener(
            object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val relay1 = snapshot.child("state").getValue(String::class.java)
                    Log.d("Notification", "onDataChange: relay1 is $relay1")
                    relay1?.let { it ->
                        if (it == "on") {
                            currentStateOfRelaySuggestion.value = "on"
                            Log.d("Notification", "onDataChange: current state is on")
                        } else {
                            currentStateOfRelaySuggestion.value = "off"
                            Log.d("Notification", "onDataChange: current state is off")
                        }
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    Log.d("MainViewModel: RelaySuggestion", "onCancelled: ${error.message}")
                }
            }
        )
    }

    fun setCurrentScreen(screen: Screen) {
        _currentScreen.value = screen
    }
}