plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.gms.google.services)
}

android {
    namespace = "com.example.smart_irrigation_app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.smart_irrigation_app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.firebase.database)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
    implementation("androidx.compose.runtime:runtime-livedata:1.8.0-rc02")

    // Essentials
    implementation(libs.material3)
    implementation(libs.material3.window.size)
    implementation(libs.material3.adaptive.navigation)
    implementation(libs.compose.icons)
    implementation(libs.lifecycle.compose)
    implementation(libs.navigation.compose)

    // Coroutines
    implementation(libs.bundles.coroutines)

    // Accompanist
    implementation(libs.bundles.accompanist)

    // Animated Nav Bar
    implementation(libs.compose.animated.navbar)

    // Networking
    implementation("io.coil-kt:coil-compose:2.5.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation(libs.retrofit)
    implementation(libs.retrofit.gson)

    // Calendar Dialog
    implementation("com.maxkeppeler.sheets-compose-dialogs:calendar:1.3.0")

    // Markdown
    implementation("com.github.jeziellago:compose-markdown:0.5.7")

    // Location
    implementation("com.google.android.gms:play-services-location:21.3.0")
}