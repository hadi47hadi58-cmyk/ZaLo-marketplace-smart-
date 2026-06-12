package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                PureWebContainerScreen()
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PureWebContainerScreen() {
    var webView: WebView? by remember { mutableStateOf(null) }

    // Handle back button clicks to navigate backward in the WebView instead of exiting the app
    BackHandler(enabled = webView?.canGoBack() == true) {
        webView?.goBack()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF080E0A)) // Matches ZaLo rich deep dark background #080e0a
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            // Keep navigation internal to the WebView
                            return false
                        }
                    }
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        databaseEnabled = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    }
                    loadUrl("file:///android_asset/web/index.html")
                    webView = this
                }
            },
            update = {
                webView = it
            }
        )
    }
}
