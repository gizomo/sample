import java.net.InetAddress
import java.net.NetworkInterface
import java.util.Enumeration
import java.util.Locale

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.sentry.android.gradle)
}

fun getIP(): String {
    val interfaces: Enumeration<NetworkInterface> = NetworkInterface.getNetworkInterfaces()

    while (interfaces.hasMoreElements()) {
        val addresses: Enumeration<InetAddress> = interfaces.nextElement().inetAddresses

        while (addresses.hasMoreElements()) {
            val address = addresses.nextElement()
            if (!address.isLoopbackAddress && address.isSiteLocalAddress && address.hostAddress.startsWith("192.168.1.")) {
                if (address.isSiteLocalAddress) {
                    return address.hostAddress
                }
            }
        }
    }

    return InetAddress.getLocalHost().hostAddress
}

fun getEnvOrDefault(key: String, default: String): String {
    val value = System.getenv(key)
    return if (value == null || value.isEmpty()) default else value
}

val envAppName: String
    get() = getEnvOrDefault("TB_ANDROID_NAME","Sample Dev")

val envVersionName: String
    get() = getEnvOrDefault("TB_VERSION_NAME", "1.0.0")

val envVersionCode: Int
    get() = getEnvOrDefault("TB_VERSION_CODE", "100").toInt()

val envVersionBranch: String
    get() = getEnvOrDefault("TB_VERSION_BRANCH", "none")

val envVersionCommit: String
    get() = getEnvOrDefault("TB_VERSION_COMMIT", "none")

val envPackageName: String
    get() = getEnvOrDefault("TB_ANDROID_PACKAGE", "com.sample")

val envAssociatedUrl: String
    get() = getEnvOrDefault("TB_COMMON_APPDOMAIN", getIP() + ":8081")

val envAssociatedScheme: String
    get() = getEnvOrDefault("TB_URL_SCHEME", "https")

val envDeeplinkScheme: String
    get() = getEnvOrDefault("TB_COMMON_DEEPLINKSCHEMA", "sample")

val envSplashBackgroundColor: String
    get() = getEnvOrDefault("TB_COMMON_SPLASHBACKGROUNDCOLOR", "#ff000000")

val envSentryDsn: String
    get() = getEnvOrDefault("TB_SENTRY_DSN", "")

android {
    namespace = "com.sample"
    compileSdk = 35
    ndkVersion = "25.2.9519653"
    buildToolsVersion = "35.0.0"

    defaultConfig {
        manifestPlaceholders += mapOf(
            "appName" to envAppName,
            "associatedUrlHost" to envAssociatedUrl,
            "deeplinkScheme" to envDeeplinkScheme,
            "sentryDsn" to envSentryDsn,
        )
        applicationId = envPackageName
        minSdk = 23
        versionCode = envVersionCode
        versionName = envVersionName
    }

    buildFeatures {
        dataBinding = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    signingConfigs {
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        create("release") {
            storeFile = file(getEnvOrDefault("TB_ANDROID_CERTIFICATE_FILE", "sample.keystore"))
            storePassword = getEnvOrDefault("TB_ANDROID_ANDROIDKEYSTOREPASSWORD", "passwd")
            keyAlias = getEnvOrDefault("TB_ANDROID_ANDROIDKEYALIAS","sample corporation")
            keyPassword = getEnvOrDefault("TB_ANDROID_ANDROIDKEYPASSWORD", "passwd")
        }
    }

    buildTypes {
        getByName("debug") {
            applicationIdSuffix = ".debug"
            isMinifyEnabled = false
            isDebuggable = true
            signingConfig = signingConfigs.getByName("debug")
            resValue("color", "splash_background", envSplashBackgroundColor)
            resValue("string", "portalUrl", "http://$envAssociatedUrl")
        }
        getByName("release") {
            isMinifyEnabled = false
            isDebuggable = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            resValue("color", "splash_background", envSplashBackgroundColor)
            resValue("string", "portalUrl", "$envAssociatedScheme://$envAssociatedUrl")
        }
        buildTypes.forEach {
            it.resValue("string", "branch", envVersionBranch)
            it.resValue("string", "commit", envVersionCommit)
        }
    }

    flavorDimensions += "version"

    productFlavors {
        create("launcher") {
            dimension = "version"
            targetSdk = 34
            resValue("string", "flavor", "launcher")
        }
        create("standalone") {
            dimension = "version"
            targetSdk = 34
            resValue("string", "flavor", "standalone")
        }
        create("market") {
            dimension = "version"
            targetSdk = 34
            resValue("string", "flavor", "market")
        }
    }

    sourceSets.getByName("market") {
        java.setSrcDirs(listOf("src/main/java", "src/packager/java"))
        res.setSrcDirs(listOf("src/main/res"))
    }

    sourceSets.getByName("launcher") {
        java.setSrcDirs(listOf("src/main/java", "src/launcher/java", "src/installer/java"))
        res.setSrcDirs(listOf("src/main/res"))
    }

    sourceSets.getByName("standalone") {
        java.setSrcDirs(listOfNotNull("src/main/java", "src/standalone/java", "src/installer/java"))
        res.setSrcDirs(listOf("src/main/res"))
    }
}

dependencies {
    "launcherImplementation"(libs.ackpine.core)
    "standaloneImplementation"(libs.ackpine.core)

    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.webkit)
    implementation(libs.okhttp)
    implementation(libs.simple.android.bridge)
}