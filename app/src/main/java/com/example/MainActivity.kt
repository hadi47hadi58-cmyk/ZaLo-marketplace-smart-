package com.example

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme
import java.io.IOException

// Premium Algerian Emerald & Gold Color Space matches Tailwind Web Colors
val ZaloNavy = Color(0xFF0B1528)
val ZaloNavyLight = Color(0xFF0F1C36)
val ZaloEmerald = Color(0xFF00875A)
val ZaloEmeraldLight = Color(0xFF10B981)
val ZaloGold = Color(0xFFD4AF37)
val ZaloGoldLight = Color(0xFFF3E5AB)

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainAppHubScreen()
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MainAppHubScreen() {
    val context = LocalContext.current
    var currentTab by remember { mutableStateOf(0) } // 0: Live Web App, 1: Code Explorer, 2: Export Manual

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = ZaloNavyLight,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = currentTab == 0,
                    onClick = { currentTab = 0 },
                    icon = { Icon(Icons.Filled.Storefront, contentDescription = "معاينة المتجر") },
                    label = { Text("معاينة المتجر 🛒", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ZaloGold,
                        selectedTextColor = ZaloGold,
                        unselectedIconColor = Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = Color.White.copy(alpha = 0.6f),
                        indicatorColor = ZaloNavy
                    )
                )
                NavigationBarItem(
                    selected = currentTab == 1,
                    onClick = { currentTab = 1 },
                    icon = { Icon(Icons.Filled.Code, contentDescription = "تصفح الأكواد") },
                    label = { Text("تصفح الأكواد 💻", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ZaloGold,
                        selectedTextColor = ZaloGold,
                        unselectedIconColor = Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = Color.White.copy(alpha = 0.6f),
                        indicatorColor = ZaloNavy
                    )
                )
                NavigationBarItem(
                    selected = currentTab == 2,
                    onClick = { currentTab = 2 },
                    icon = { Icon(Icons.Filled.Download, contentDescription = "تنزيل ZIP") },
                    label = { Text("تنزيل ZIP 📦", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = ZaloGold,
                        selectedTextColor = ZaloGold,
                        unselectedIconColor = Color.White.copy(alpha = 0.6f),
                        unselectedTextColor = Color.White.copy(alpha = 0.6f),
                        indicatorColor = ZaloNavy
                    )
                )
            }
        },
        contentWindowInsets = WindowInsets.navigationBars
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(ZaloNavy)
                .padding(innerPadding)
        ) {
            // Elegant Hub Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ZaloNavyLight)
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Text(
                            text = "ZaLo Smart Web Hub",
                            color = ZaloGold,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "بيئة محاكاة واجهات الويب التجريبية المتكاملة",
                            color = Color.White.copy(alpha = 0.7f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    
                    Surface(
                        color = ZaloEmerald.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(1.dp, ZaloEmeraldLight.copy(alpha = 0.3f))
                    ) {
                        Text(
                            text = "جاهز للتصدير ✨",
                            color = ZaloEmeraldLight,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Divider(color = Color.White.copy(alpha = 0.08f))

            // Tab Content
            Box(modifier = Modifier.fillMaxSize()) {
                when (currentTab) {
                    0 -> WebViewCompanion(context = context)
                    1 -> WebCodeExplorer(context = context)
                    2 -> StandaloneExportManual()
                }
            }
        }
    }
}

@Composable
fun WebViewCompanion(context: Context) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            WebView(ctx).apply {
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                        return false // keep navigation internal to webview assets
                    }
                }
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                }
                // Load embedded assets index.html
                loadUrl("file:///android_asset/web/index.html")
            }
        }
    )
}

@Composable
fun WebCodeExplorer(context: Context) {
    var selectedFileIndex by remember { mutableStateOf(0) } // 0: index.html, 1: app.js, 2: style.css
    val fileNames = listOf("index.html", "app.js", "style.css")
    val filePaths = listOf("web/index.html", "web/app.js", "web/style.css")
    
    var fileContent by remember { mutableStateOf("جاري استدعاء محتوى الكود...") }

    // Read asset content asynchronously when selection changes
    LaunchedEffect(selectedFileIndex) {
        fileContent = try {
            context.assets.open(filePaths[selectedFileIndex]).bufferedReader().use { it.readText() }
        } catch (e: IOException) {
            "عذراً، فشل تحميل محتوى الملف: ${e.localizedMessage}"
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(14.dp)
    ) {
        // Selection Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            fileNames.forEachIndexed { index, name ->
                val isSelected = selectedFileIndex == index
                Surface(
                    onClick = { selectedFileIndex = index },
                    color = if (isSelected) ZaloEmerald else ZaloNavyLight,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(
                        width = 1.dp,
                        color = if (isSelected) ZaloEmeraldLight else Color.White.copy(alpha = 0.1f)
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = name,
                        color = if (isSelected) Color.White else Color.White.copy(alpha = 0.7f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 10.dp)
                    )
                }
            }
        }

        // Action Toolbar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(ZaloNavyLight, RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Surface(color = Color.Red.copy(0.15f), shape = RoundedCornerShape(4.dp), modifier = Modifier.size(8.dp)) {}
                Surface(color = Color.Yellow.copy(0.15f), shape = RoundedCornerShape(4.dp), modifier = Modifier.size(8.dp)) {}
                Surface(color = Color.Green.copy(0.15f), shape = RoundedCornerShape(4.dp), modifier = Modifier.size(8.dp)) {}
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "مستعرض الأكواد المضيء",
                    color = Color.White.copy(alpha = 0.5f),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Button(
                onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("ZaLo Web File", fileContent)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(context, "تم نسخ محتوى الملف بنجاح! 📋", Toast.LENGTH_SHORT).show()
                },
                colors = ButtonDefaults.buttonColors(containerColor = ZaloGold),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.height(28.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Icon(Icons.Filled.ContentCopy, contentDescription = "نسخ الكود", modifier = Modifier.size(12.dp), tint = ZaloNavy)
                    Text("نسخ الكود الكامل", color = ZaloNavy, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Code Editor Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .background(Color(0xFF070D19))
                .border(
                    width = 1.dp,
                    color = Color.White.copy(alpha = 0.08f),
                    shape = RoundedCornerShape(bottomStart = 12.dp, bottomEnd = 12.dp)
                )
                .padding(12.dp)
        ) {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                item {
                    Text(
                        text = fileContent,
                        color = Color(0xFFC5C9DB),
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        lineHeight = 16.sp,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

@Composable
fun StandaloneExportManual() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = ZaloNavyLight),
                border = BorderStroke(1.dp, ZaloGold.copy(alpha = 0.2f)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Filled.FolderZip, contentDescription = "تنزيل", tint = ZaloGold, modifier = Modifier.size(24.dp))
                        Text(
                            text = "تحميل حزمة الويب وتنزيلها مستقلة (ZIP)",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = "لقد قمنا بتنظيم وتصدير المشروع بالكامل كشبكة ويب فرعية متناسقة للغاية وملائمة للتحميل المباشر والتشغيل المستقل تماماً على متصفحك الشخصي.",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        item {
            Text(
                text = "💡 خطوات التنزيل السريع من بيئة عملك:",
                color = ZaloGold,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }

        val stepList = listOf(
            StepItemData("1", "تصدير الملف المجمع", "في لوحة التحكم والتحرير الحالية لـ AI Studio، ابحث عن خيار الإعدادات (Settings Panel)."),
            StepItemData("2", "التحميل في ثوانٍ", "اضغط خيار (Export Project as ZIP) لتنزيل ملفات المشروع مجمعة بالكامل فوراً."),
            StepItemData("3", "استخراج حزمة المطور", "فك الضغط عن الملف المجمع لتعثر على مجلد رئيسي مخصص باسم /web/ في جذر المشروع."),
            StepItemData("4", "التشغيل كـ Web App", "انقر نقراً مزدوجاً على ملف index.html في اللابتوب أو المتصفح الخاص بك ليفتح السوق الجزائري كملف محلي مستقل وممتاز!")
        )

        items(stepList.size) { index ->
            val step = stepList[index]
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ZaloNavyLight, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = ZaloEmerald,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(text = step.number, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = step.title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(text = step.subtitle, color = Color.White.copy(alpha = 0.6f), fontSize = 10.sp, lineHeight = 14.sp)
                }
            }
        }

        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ZaloEmerald.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
                    .border(1.dp, ZaloEmeraldLight.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Filled.Verified, contentDescription = "تميز", tint = ZaloEmeraldLight, modifier = Modifier.size(20.dp))
                    Text(
                        text = "المنصة متوافقة كلياً وبمعدلات أداء عالية للأجهزة الخلوية وتوفر تجربة تفاعلية تفوق المتوقع!",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }
}

data class StepItemData(
    val number: String,
    val title: String,
    val subtitle: String
)


