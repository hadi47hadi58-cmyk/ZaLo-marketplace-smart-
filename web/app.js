// ZaLo Smart Marketplace - JavaScript Engine (app.js)
// 100% Client-Side State Engine with localStorage Persistence

// --- Initial Mock Seed Data ---
const DEFAULT_USERS = [
    { id: 1, email: "hadi47hadi58@gmail.com", name: "عبد الهادي نجم الدين", role: "CUSTOMER", status: "ACTIVE", wilaya: "الجزائر", commune: "المرسى", loyaltyPoints: 1250 },
    { id: 2, email: "merchant@zalo.dz", name: "أحمد بن زكري", role: "MERCHANT", status: "ACTIVE", wilaya: "وهران", commune: "سيدي الهواري", loyaltyPoints: 340 },
    { id: 3, email: "admin@zalo.dz", name: "مشرف المنصة الرئيسي", role: "ADMIN", status: "ACTIVE", wilaya: "الجزائر", commune: "حيدرة", loyaltyPoints: 9999 }
];

const DEFAULT_STORES = [
    { id: 101, merchantId: 2, name: "متجر النور للإلكترونيات", description: "أقوى الهواتف الذكية وسماعات الأذن وأجهزة الكمبيوتر المستوردة بأرخص الأسعار مع ضمان لمدة سنة كاملة.", phone: "0555353535", whatsapp: "213555353535", wilaya: "وهران", commune: "سيدي الهواري", category: "ELECTRONICS", status: "APPROVED", rating: 4.8 },
    { id: 102, merchantId: 4, name: "أخضر بازار للمنتجات الطبيعية", description: "خضار وفواكه صحية طازجة من مزارع متيجة بالجزائر إلى باب منزلك مباشرة، جودة لا تقارن.", phone: "0561234567", whatsapp: "213561234567", wilaya: "الجزائر", commune: "المرسى", category: "FOOD", status: "APPROVED", rating: 4.5 }
];

const DEFAULT_PRODUCTS = [
    { id: 1001, storeId: 101, name: "سماعات أنكر اللاسلكية Soundcore X", description: "سماعات أصلية مانعة للضوضاء وبطارية تدوم لـ 40 ساعة متواصلة مع شحن سريع جداً وجسد رياضي مقاوم للعرق.", price: 7900.00, category: "ELECTRONICS", stock: 12, salesCount: 45, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80" },
    { id: 1002, storeId: 101, name: "ساعة شاومي ريدمي الذكية 4", description: "شاشة AMOLED ملونة، حساس قياس نبضات القلب ونسبة الأكسجين في الدم مع تتبع الرياضات المتنوعة وبطارية 14 يوم.", price: 9200.00, category: "ELECTRONICS", stock: 6, salesCount: 22, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" },
    { id: 1003, storeId: 102, name: "سلة التوفير العائلية الصحية للغذاء", description: "سلة تزن 12 كجم من البطاطس، البصل، الطماطم والجزر الطازج الفاخر بالإضافة لزيت زيتون بكر مضغوط على البارد.", price: 2900.00, category: "FOOD", stock: 20, salesCount: 88, rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80" },
    { id: 1004, storeId: 101, name: "شاحن سريع للأيفون والسامسونج 35W", description: "شاحن مزدوج المنافذ Type-C بقدرة خارقة ومحمي ضد الارتفاع المفاجئ للتيار الكهربائي في البيوت الجزائرية.", price: 2300.00, category: "ELECTRONICS", stock: 35, salesCount: 15, rating: 4.3, imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80" },
    { id: 1005, storeId: 102, name: "معجون دقلة نور الجزائرية الفاخر", description: "معجون طبيعي مصنوع من تمور دقلة نور تولقة الخالية من السكر المضاف والمواد الحافظة الكيماوية لسلامة أطفالك.", price: 1200.00, category: "FOOD", stock: 40, salesCount: 5, rating: 4.2, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80" }
];

const DEFAULT_ORDERS = [
    { id: 5001, customerId: 1, storeId: 101, storeName: "متجر النور للإلكترونيات", status: "SHIPPING", totalAmount: 10100.00, paymentMethod: "COD", paymentStatus: "PENDING", deliveryFee: 400.0, address: "حي المستقبل، المقابل للدائرة، الطابق الأول", timestamp: Date.now() - 3600000 * 4 },
    { id: 5002, customerId: 1, storeId: 102, storeName: "أخضر بازار للمنتجات الطبيعية", status: "DELIVERED", totalAmount: 3300.00, paymentMethod: "BARIDIMOB", paymentStatus: "CONFIRMED", deliveryFee: 400.0, address: "شارع المجاهدين الشق الأول، هضبة المرسى", timestamp: Date.now() - 3600000 * 48 }
];

const DEFAULT_ORDER_ITEMS = [
    { id: 6001, orderId: 5001, productId: 1004, productName: "شاحن سريع للأيفون والسامسونج 35W", price: 2300.00, quantity: 1 },
    { id: 6002, orderId: 5001, productId: 1001, productName: "سماعات أنكر اللاسلكية Soundcore X", price: 7900.00, quantity: 1 },
    { id: 6003, orderId: 5002, productId: 1003, productName: "سلة التوفير العائلية الصحية للغذاء", price: 2900.00, quantity: 1 }
];

const DEFAULT_COMPLAINTS = [
    { id: 7001, orderId: 5001, userId: 1, userName: "عبد الهادي نجم الدين", message: "تأخر الموصل قليلاً بالرغم من اتصالي به، أرجو تبليغه ليكون أسرع في أحياء المرسى.", status: "PENDING", timestamp: Date.now() - 3600000 * 2 }
];

const DEFAULT_SUBS = [
    { id: 8001, merchantId: 2, planName: "SMART_ENTERPRISE", status: "ACTIVE", price: 4500.00, paymentReceiptUrl: "BaridiMob-CCP-Proof-45.png", startDate: Date.now() - 86400000 * 3, endDate: Date.now() + 86400000 * 27 }
];

const DEFAULT_VERIFICATIONS = [
    { id: 9101, merchantId: 2, merchantName: 'أحمد بن زكري', commercialRegisterCode: '16/00-045321B19', nationalIdNumber: '1102380293810', commercialRegisterFileUrl: 'cr-98319.pdf', nationalIdCardFileUrl: 'nid-9823.png', isVerified: true, submittedAt: Date.now() - 86400005 * 5, verifiedAt: Date.now() - 86400005 * 4 }
];

const DEFAULT_AUDIT = [
    { id: 9001, actorName: "النظام الذكي تلقائياً", action: "SETUP", details: "تشغيل وتهيئة تطبيق الويب الذكي بالتكامل مع متصفح AI Studio بنجاح.", timestamp: Date.now() - 3600000 * 12 },
    { id: 9002, actorName: "عبد الهادي نجم الدين", action: "LOGIN", details: "تسجيل دخول زبون مألوف بالنظام عن طريق البريد الإلكتروني.", timestamp: Date.now() - 3600000 }
];

const DEFAULT_NOTIFS = [
    { id: 2501, userId: 1, title: "مرحباً بك في ZaLo", message: "تم تفعيل حسابك كزبون رائد، تفضل بمشاهدة التوصيات الذكية لولايتك!", isRead: false, timestamp: Date.now() }
];

const AI_ शॉपिंग_توصيات = [
    "بناءً على موقعك في ولاية *الجزائر* ونشاطك الأخير، نقترح عليك شراء *سلة التوفير العائلية الصحية* (DZD 2,900) من مزارعنا الشريكة بتوصيل فوري مخفض.",
    "عروض مخصصة لسكان ولايتك: متجر *النور للإلكترونيات* يطرح كود حسم بقيمة *10%* على *ساعة شاومي ريدمي الذكية* مع شحن للبلديات خلال 24 ساعة فقط."
];

// --- App State Management ---
let state = {
    users: [],
    stores: [],
    products: [],
    orders: [],
    orderItems: [],
    complaints: [],
    subs: [],
    verifications: [],
    auditLogs: [],
    notifs: [],
    currentUser: null,
    currentRole: "CUSTOMER",  // "CUSTOMER", "MERCHANT", "ADMIN"
    cart: {}, // productId -> quantity
    activeTab: "customer"     // "customer", "merchant", "admin", "ai-chat"
};

// --- Storage API ---
function loadStateFromStorage() {
    try {
        if (!localStorage.getItem("zalo_users")) {
            localStorage.setItem("zalo_users", JSON.stringify(DEFAULT_USERS));
            localStorage.setItem("zalo_stores", JSON.stringify(DEFAULT_STORES));
            localStorage.setItem("zalo_products", JSON.stringify(DEFAULT_PRODUCTS));
            localStorage.setItem("zalo_orders", JSON.stringify(DEFAULT_ORDERS));
            localStorage.setItem("zalo_order_items", JSON.stringify(DEFAULT_ORDER_ITEMS));
            localStorage.setItem("zalo_complaints", JSON.stringify(DEFAULT_COMPLAINTS));
            localStorage.setItem("zalo_subs", JSON.stringify(DEFAULT_SUBS));
            localStorage.setItem("zalo_verifications", JSON.stringify(DEFAULT_VERIFICATIONS));
            localStorage.setItem("zalo_audit", JSON.stringify(DEFAULT_AUDIT));
            localStorage.setItem("zalo_notifs", JSON.stringify(DEFAULT_NOTIFS));
        }

        state.users = JSON.parse(localStorage.getItem("zalo_users"));
        state.stores = JSON.parse(localStorage.getItem("zalo_stores"));
        state.products = JSON.parse(localStorage.getItem("zalo_products"));
        state.orders = JSON.parse(localStorage.getItem("zalo_orders"));
        state.orderItems = JSON.parse(localStorage.getItem("zalo_order_items"));
        state.complaints = JSON.parse(localStorage.getItem("zalo_complaints"));
        state.subs = JSON.parse(localStorage.getItem("zalo_subs"));
        state.verifications = JSON.parse(localStorage.getItem("zalo_verifications") || "[]");
        state.auditLogs = JSON.parse(localStorage.getItem("zalo_audit"));
        state.notifs = JSON.parse(localStorage.getItem("zalo_notifs"));

        // Set Default Active User: customer (Hadi)
        state.currentUser = state.users.find(u => u.email === "hadi47hadi58@gmail.com") || state.users[0];
        state.currentRole = state.currentUser.role;
        
        // Load cart
        const savedCart = localStorage.getItem("zalo_cart_" + state.currentUser.id);
        state.cart = savedCart ? JSON.parse(savedCart) : {};

    } catch (e) {
        console.error("Failed to load local storage state", e);
    }
}

function saveToLocalStorage(key, arrayData) {
    try {
        localStorage.setItem(key, JSON.stringify(arrayData));
    } catch (e) {
        console.error("Save error: ", e);
    }
}

function updateDatabaseState() {
    saveToLocalStorage("zalo_users", state.users);
    saveToLocalStorage("zalo_stores", state.stores);
    saveToLocalStorage("zalo_products", state.products);
    saveToLocalStorage("zalo_orders", state.orders);
    saveToLocalStorage("zalo_order_items", state.orderItems);
    saveToLocalStorage("zalo_complaints", state.complaints);
    saveToLocalStorage("zalo_subs", state.subs);
    saveToLocalStorage("zalo_verifications", state.verifications);
    saveToLocalStorage("zalo_audit", state.auditLogs);
    saveToLocalStorage("zalo_notifs", state.notifs);
}

// Log an action to audit log
function logAudit(actorName, action, details) {
    const newEntry = {
        id: Date.now(),
        actorName: actorName,
        action: action,
        details: details,
        timestamp: Date.now()
    };
    state.auditLogs.unshift(newEntry);
    saveToLocalStorage("zalo_audit", state.auditLogs);
    renderAuditLogs();
}

// Add system notification for user id
function addNotification(userId, title, message) {
    const newNotif = {
        id: Date.now(),
        userId: userId,
        title: title,
        message: message,
        isRead: false,
        timestamp: Date.now()
    };
    state.notifs.unshift(newNotif);
    saveToLocalStorage("zalo_notifs", state.notifs);
    updateNotificationBadge();
}

// --- Dynamic Rendering: UI Functions ---

function setRole(role) {
    state.currentRole = role;
    
    // Switch active user based on role simulation
    if (role === "CUSTOMER") {
        state.currentUser = state.users.find(u => u.role === "CUSTOMER") || state.users[0];
        switchTab("customer");
    } else if (role === "MERCHANT") {
        state.currentUser = state.users.find(u => u.role === "MERCHANT") || state.users[1];
        switchTab("merchant");
    } else if (role === "ADMIN") {
        state.currentUser = state.users.find(u => u.role === "ADMIN") || state.users[2];
        switchTab("admin");
    }

    // Refresh active buttons visual classes
    ['btn-role-customer', 'btn-role-merchant', 'btn-role-admin'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.className = "text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 text-white/70 hover:text-white";
        }
    });

    const activeBtn = document.getElementById('btn-role-' + role.toLowerCase());
    if (activeBtn) {
        activeBtn.className = "text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 bg-zalo-emerald text-white shadow";
    }

    // Reload user-related structures
    const savedCart = localStorage.getItem("zalo_cart_" + state.currentUser.id);
    state.cart = savedCart ? JSON.parse(savedCart) : {};
    
    updateCartCountBadge();
    updateNotificationBadge();
    refreshAiRecommendations();
    logAudit(state.currentUser.name, "SIMULATION_SWITCH", `Switched layout view to role profile: ${role}`);
}

function switchTab(tabId) {
    state.activeTab = tabId;
    
    // Hide all main section screens
    ['screen-customer', 'screen-merchant', 'screen-admin', 'screen-ai-chat'].forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add("hidden");
    });

    // Show correct one
    const activeScreen = document.getElementById('screen-' + tabId);
    if (activeScreen) activeScreen.classList.remove("hidden");

    // Re-render and load specific configurations
    if (tabId === "customer") {
        renderProductsGrid();
        renderCustomerOrders();
        renderCustomerComplaints();
    } else if (tabId === "merchant") {
        renderMerchantDashboard();
    } else if (tabId === "admin") {
        renderAdminDashboard();
    } else if (tabId === "ai-chat") {
        renderAiChatMessages();
    }
}

// Global filter state
let currentFilters = { search: "", category: "ALL", wilaya: "ALL" };

function resetFilters() {
    document.getElementById('filter-search').value = "";
    document.getElementById('filter-category').value = "ALL";
    document.getElementById('filter-wilaya').value = "ALL";
    applyFilters();
}

function applyFilters() {
    currentFilters.search = document.getElementById('filter-search').value.toLowerCase().trim();
    currentFilters.category = document.getElementById('filter-category').value;
    currentFilters.wilaya = document.getElementById('filter-wilaya').value;
    renderProductsGrid();
}

function renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    const emptyAlert = document.getElementById('product-list-empty');
    if (!grid) return;

    grid.innerHTML = "";

    // Filter products
    const filteredProducts = state.products.filter(p => {
        // Find store details to check Store Wilaya
        const store = state.stores.find(s => s.id === p.storeId);
        if (!store || store.status !== "APPROVED") return false;

        const matchesSearch = p.name.toLowerCase().includes(currentFilters.search) || 
                              p.description.toLowerCase().includes(currentFilters.search);
        
        const matchesCategory = currentFilters.category === "ALL" || p.category === currentFilters.category;
        const matchesWilaya = currentFilters.wilaya === "ALL" || store.wilaya === currentFilters.wilaya;

        return matchesSearch && matchesCategory && matchesWilaya;
    });

    // Badges update
    const countBadge = document.getElementById('product-count-badge');
    if (countBadge) countBadge.innerText = `${filteredProducts.length} متوفر`;

    if (filteredProducts.length === 0) {
        if (emptyAlert) emptyAlert.classList.remove("hidden");
        return;
    } else {
        if (emptyAlert) emptyAlert.classList.add("hidden");
    }

    filteredProducts.forEach(p => {
        const store = state.stores.find(s => s.id === p.storeId);
        const card = document.createElement('div');
        card.className = "zalo-glass-card rounded-2xl overflow-hidden hover:border-zalo-emeraldLight/30 border border-white/5 transition duration-300 flex flex-col group relative";
        
        card.innerHTML = `
            <!-- Product Image -->
            <div class="h-44 w-full relative overflow-hidden bg-zalo-navy leading-none">
                <img src="${p.imageUrl}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                <span class="absolute top-2.5 right-2.5 bg-zalo-navy/95 text-zalo-gold text-[10px] font-black px-2.5 py-1 rounded-full border border-zalo-gold/10">
                    <i class="fa-solid fa-location-dot text-red-500"></i> ${store ? store.wilaya : "الجزائر"}
                </span>
                <span class="absolute top-2.5 left-2.5 bg-zalo-emerald/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ${translateCategory(p.category)}
                </span>
            </div>

            <!-- Product Details -->
            <div class="p-4 flex-grow flex flex-col justify-between">
                <div class="space-y-1">
                    <div class="text-[10px] text-white/50 font-bold flex items-center justify-between">
                        <span><i class="fa-solid fa-store text-zalo-gold"></i> ${store ? store.name : "متجر ذكي"}</span>
                        <span>⭐ ${p.rating}</span>
                    </div>
                    <h4 class="text-xs font-black text-white group-hover:text-zalo-gold transition duration-200">${p.name}</h4>
                    <p class="text-[10px] text-white/60 line-clamp-2 leading-relaxed">${p.description}</p>
                </div>

                <div class="pt-3 border-t border-white/5 mt-4 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-white/40 block">السعر المستحق</span>
                        <span class="text-xs font-extrabold text-zalo-gold">${p.price.toLocaleString()} DZD</span>
                    </div>
                    
                    <button onclick="addToCart(${p.id})" class="px-3 py-1.5 bg-zalo-emerald hover:bg-zalo-emeraldLight text-white font-black text-[10px] rounded-lg transition duration-200">
                        <i class="fa-solid fa-cart-plus"></i> اضف للسلة
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function translateCategory(cat) {
    switch (cat) {
        case "ELECTRONICS": return "أجهزة إلكترونية";
        case "FASHION": return "ملابس وأزياء";
        case "FOOD": return "خضار وأطعمة";
        case "COSMETICS": return "تجميل";
        case "HOME": return "أثاث ومنزل";
        default: return cat;
    }
}

// --- Shopping Cart Engines ---

function updateCartCountBadge() {
    const totalCount = Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = totalCount;
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (state.cart[productId]) {
        state.cart[productId] += 1;
    } else {
        state.cart[productId] = 1;
    }

    localStorage.setItem("zalo_cart_" + state.currentUser.id, JSON.stringify(state.cart));
    updateCartCountBadge();
    
    // Add dynamic notification of success
    addNotification(state.currentUser.id, "أضيف للسلة", `لقد تمت إضافة '${product.name}' إلى سلة مشترياتك بنجاح!`);
    logAudit(state.currentUser.name, "ADD_TO_CART", `Added product #${productId} (${product.name}) to cart.`);
    
    // Toast alert simulating
    showToastNotification(`تم إضافة المنتج: ${product.name}`);
}

function toggleCartDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden');
        if (!overlay.classList.contains('hidden')) {
            renderCart();
        }
    }
}

function showToastNotification(text) {
    const notifier = document.createElement('div');
    notifier.className = "fixed bottom-5 right-5 z-50 bg-zalo-emerald text-white px-4 py-2.5 rounded-xl shadow-2xl border border-zalo-emeraldLight/30 text-xs font-bold transition duration-300";
    notifier.innerText = text;
    document.body.appendChild(notifier);
    setTimeout(() => {
        notifier.remove();
    }, 2500);
}

// Render complete shopping items
function renderCart() {
    const container = document.getElementById('cart-items-container');
    const btt_block = document.getElementById('cart-totals-checkout-block');
    if (!container) return;

    container.innerHTML = "";

    const cartEntries = Object.entries(state.cart);
    if (cartEntries.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center p-12 text-center h-full">
                <i class="fa-solid fa-basket-shopping text-4xl text-white/10 mb-2"></i>
                <p class="text-xs text-white/50">سلة المشتريات فارغة تماماً، تصفح الكتالوج لشراء السلع.</p>
            </div>
        `;
        if (btt_block) btt_block.classList.add("hidden");
        return;
    }

    if (btt_block) btt_block.classList.remove("hidden");
    let subtotal = 0;

    cartEntries.forEach(([prodId, qty]) => {
        const product = state.products.find(p => p.id === parseInt(prodId));
        if (!product) return;

        const priceTotal = product.price * qty;
        subtotal += priceTotal;

        const itemRow = document.createElement('div');
        itemRow.className = "bg-zalo-navy/50 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3";
        itemRow.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${product.imageUrl}" class="w-10 h-10 object-cover rounded-lg">
                <div>
                    <h5 class="text-xs font-bold text-white line-clamp-1">${product.name}</h5>
                    <p class="text-[10px] text-zalo-gold font-bold mt-0.5">${product.price.toLocaleString()} DZD</p>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-zalo-navy rounded-lg p-1 border border-white/10">
                    <button onclick="decrementCartItem(${product.id})" class="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded font-bold text-white">-</button>
                    <span class="text-xs text-white font-bold px-1.5">${qty}</span>
                    <button onclick="incrementCartItem(${product.id})" class="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded font-bold text-white">+</button>
                </div>
                <button onclick="removeCartItem(${product.id})" class="text-white/40 hover:text-red-400 p-1.5 transition"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        container.appendChild(itemRow);
    });

    // Update Totals
    const devFee = 400; // Fixed delivery DZD
    document.getElementById('cart-subtotal').innerText = `${subtotal.toLocaleString()} DZD`;
    document.getElementById('cart-delivery-fee').innerText = `${devFee} DZD`;
    document.getElementById('cart-grandtotal').innerText = `${(subtotal + devFee).toLocaleString()} DZD`;
}

function incrementCartItem(productId) {
    state.cart[productId] += 1;
    localStorage.setItem("zalo_cart_" + state.currentUser.id, JSON.stringify(state.cart));
    updateCartCountBadge();
    renderCart();
}

function decrementCartItem(productId) {
    if (state.cart[productId] <= 1) {
        removeCartItem(productId);
        return;
    }
    state.cart[productId] -= 1;
    localStorage.setItem("zalo_cart_" + state.currentUser.id, JSON.stringify(state.cart));
    updateCartCountBadge();
    renderCart();
}

function removeCartItem(productId) {
    delete state.cart[productId];
    localStorage.setItem("zalo_cart_" + state.currentUser.id, JSON.stringify(state.cart));
    updateCartCountBadge();
    renderCart();
}

// --- Checkout engine ---

function toggleCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.toggle('hidden');
}

function openCheckoutModal() {
    toggleCartDrawer();
    toggleCheckoutModal();
    updateCheckoutPaymentDetails();
}

function updateCheckoutPaymentDetails() {
    const method = document.getElementById('chk-payment-method').value;
    const desc = document.getElementById('payment-details-info');
    if (!desc) return;

    if (method === "COD") {
        desc.innerHTML = `
            <i class="fa-solid fa-money-bill-wave text-zalo-gold text-lg shrink-0 mt-0.5"></i>
            <div>
                <span class="font-bold text-white block">الدفع نقدًا عند التسليم (COD)</span>
                أكد طلبك الآن وادفع القيمة الإجمالية عند وصول السلعة لباب منزلك مع عامل التوصيل في ولايتك.
            </div>
        `;
    } else if (method === "BARIDIMOB") {
        desc.innerHTML = `
            <i class="fa-solid fa-building-columns text-zalo-gold text-lg shrink-0 mt-0.5"></i>
            <div>
                <span class="font-bold text-white block">الدفع عبر تطبيق بريدي موب الذكي (BaridiMob)</span>
                يرجى تحويل القيمة الإجمالية إلى رقم الـ RIP التالي الخاص بالمنصة:
                <code class="block bg-zalo-navy p-1.5 rounded text-white font-bold my-1 text-center select-all cursor-pointer">00799999002548795588</code>
                ثم ارفع لقطة الشاشة مع تأكيد الطلب لتجهيز شحنتك فوراً.
            </div>
        `;
    } else if (method === "CCP") {
        desc.innerHTML = `
            <i class="fa-solid fa-credit-card text-zalo-gold text-lg shrink-0 mt-0.5"></i>
            <div>
                <span class="font-bold text-white block">تحويل بريد الجزائر CCP كارد والتحقق السريع</span>
                قم بملء حوالة بريدية ccp بقيمة الطلب في أقرب مكتب بريد لـ:
                <code class="block bg-zalo-navy p-1.5 rounded text-white font-bold my-1 text-center select-all cursor-pointer">CCP: 10394857 المفتاح 42</code>
                واحتفظ بالوصل لتسجيله وتأكيد الشحن فورياً.
            </div>
        `;
    }
}

function submitCheckoutOrder() {
    const name = document.getElementById('chk-name').value.trim();
    const address = document.getElementById('chk-address').value.trim() || "حي المرسى الرئيسي";
    const paymentMethod = document.getElementById('chk-payment-method').value;
    const wilaya = document.getElementById('chk-wilaya').value;

    if (Object.keys(state.cart).length === 0) {
        alert("سلتك فارغة، تفضل بإضافة عروض جديدة قبل اتمام الدفع.");
        return;
    }

    const firstProductEntry = Object.entries(state.cart)[0];
    const productItem = state.products.find(p => p.id === parseInt(firstProductEntry[0]));
    const store = state.stores.find(s => s.id === productItem.storeId);
    const storeName = store ? store.name : "متجر ذكي";
    const storeId = store ? store.id : 101;

    let totalProd = 0;
    Object.entries(state.cart).forEach(([pId, qty]) => {
        const prod = state.products.find(p => p.id === parseInt(pId));
        if (prod) totalProd += prod.price * qty;
    });

    const finalSum = totalProd + 400; // Total with delivery

    // Generate Order
    const newOrder = {
        id: 5000 + state.orders.length + 1,
        customerId: state.currentUser.id,
        storeId: storeId,
        storeName: storeName,
        status: "PENDING",
        totalAmount: finalSum,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "CONFIRMED",
        deliveryFee: 400.0,
        address: `${wilaya} - ${address}`,
        timestamp: Date.now()
    };

    // Store Order Items
    Object.entries(state.cart).forEach(([pId, qty]) => {
        const prod = state.products.find(p => p.id === parseInt(pId));
        if (prod) {
            state.orderItems.push({
                id: Date.now() + Math.random(),
                orderId: newOrder.id,
                productId: prod.id,
                productName: prod.name,
                price: prod.price,
                quantity: qty
            });
        }
    });

    state.orders.unshift(newOrder);
    updateDatabaseState();

    // Clear cart
    state.cart = {};
    localStorage.setItem("zalo_cart_" + state.currentUser.id, JSON.stringify(state.cart));
    updateCartCountBadge();

    toggleCheckoutModal();
    renderCustomerOrders();
    addNotification(state.currentUser.id, "قيد التحضير 📦", `تم تسجيل طلبك رقم #${newOrder.id} لمتجر ${storeName} بنجاح وقيد المراجعة للتحضير.`);
    logAudit(name, "PLACE_ORDER", `Placed order #${newOrder.id} to store ${storeName} with sum of ${finalSum} DZD`);
    
    // Congrats alert
    showToastNotification("تم تقديم وتأكيد طلب الشراء بنجاح!");
}

// --- Dynamic Customer Orders Panel ---

function renderCustomerOrders() {
    const list = document.getElementById('customer-orders-list');
    if (!list) return;

    list.innerHTML = "";

    const myOrders = state.orders.filter(o => o.customerId === state.currentUser.id);
    if (myOrders.length === 0) {
        list.innerHTML = `
            <p class="text-[11px] text-white/50 text-center py-4">لم تقم بإجراء أي طلب تتبع للشراء بعد.</p>
        `;
        return;
    }

    myOrders.forEach(o => {
        const item = document.createElement('div');
        item.className = "bg-zalo-navy/70 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-2 text-xs";
        
        let statusBadge = "";
        if (o.status === "PENDING") statusBadge = "<span class='text-[10px] bg-zalo-gold/15 text-zalo-gold px-2.5 py-0.5 rounded-full font-bold border border-zalo-gold/30'>انتظار ⏳</span>";
        else if (o.status === "SHIPPING") statusBadge = "<span class='text-[10px] bg-blue-500/15 text-blue-400 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30'>في الطريق 🚚</span>";
        else if (o.status === "DELIVERED") statusBadge = "<span class='text-[10px] bg-zalo-emerald/15 text-zalo-emeraldLight px-2.5 py-0.5 rounded-full font-bold border border-zalo-emerald/30'>اكتمل التسليم ✅</span>";

        item.innerHTML = `
            <div>
                <h5 class="font-extrabold text-white">طلب رقم #${o.id} – ${o.storeName}</h5>
                <p class="text-[10px] text-white/50 mt-1"><i class="fa-solid fa-credit-card"></i> الدفع: ${o.paymentMethod} ($ {o.totalAmount.toLocaleString()} DZD)</p>
                <p class="text-[9px] text-white/40 mt-0.5"><i class="fa-regular fa-clock"></i> التاريخ: ${new Date(o.timestamp).toLocaleString('ar-DZ')}</p>
            </div>
            <div class="text-left">
                ${statusBadge}
            </div>
        `;
        list.appendChild(item);
    });
}

// --- Customer Support complaints ---

function toggleComplaintModal() {
    const modal = document.getElementById('complaint-modal');
    if (modal) modal.classList.toggle('hidden');
}

function openComplaintModal() {
    const list = document.getElementById('comp-order-id');
    if (!list) return;

    list.innerHTML = "";

    const myOrders = state.orders.filter(o => o.customerId === state.currentUser.id);
    if (myOrders.length === 0) {
        alert("يجب شراء طلبات ليكون بمقدورك تقديم شكوى وحماية مستهلك!");
        return;
    }

    myOrders.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.innerText = `طلب #${o.id} من متجر ${o.storeName} (${o.totalAmount.toLocaleString()} DZD)`;
        list.appendChild(opt);
    });

    toggleComplaintModal();
}

function submitUserComplaint() {
    const orderId = parseInt(document.getElementById('comp-order-id').value);
    const message = document.getElementById('comp-message').value.trim();

    if (!message) {
        alert("يرجى وصف المشكلة قبل الإرسال لتسهيل مساعدة الدعم الفني.");
        return;
    }

    const newComplaint = {
        id: 7000 + state.complaints.length + 1,
        orderId: orderId,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        message: message,
        status: "PENDING",
        timestamp: Date.now()
    };

    state.complaints.unshift(newComplaint);
    updateDatabaseState();

    toggleComplaintModal();
    renderCustomerComplaints();
    
    addNotification(state.currentUser.id, "سجل الدعم الفني", `تم استقبال تذكرة النزاع للطلب #${orderId}، وتتم دراستها حالياً.`);
    logAudit(state.currentUser.name, "SUBMIT_COMPLAINT", `Filed complaint ticket #${newComplaint.id} regarding order #${orderId}`);
    
    showToastNotification("تم إرسال بلاغ النزاع بنجاح!");
}

function renderCustomerComplaints() {
    const holder = document.getElementById('customer-complaints-list');
    if (!holder) return;

    holder.innerHTML = "";

    const myComp = state.complaints.filter(c => c.userId === state.currentUser.id);
    if (myComp.length === 0) {
        holder.innerHTML = `<p class="text-[11px] text-white/50 text-center py-4">لا توجد لديك شكاوى نزاع مرفوعة حالياً.</p>`;
        return;
    }

    myComp.forEach(c => {
        const card = document.createElement('div');
        card.className = "p-3 rounded-xl bg-zalo-navy/70 border border-white/5 text-[11px]";
        
        let statB = c.status === "PENDING" ? 
            "<span class='text-zalo-gold border border-zalo-gold/20 bg-zalo-gold/10 px-2 py-0.5 rounded'>قيد النظر 🛡️</span>" : 
            "<span class='text-zalo-emeraldLight border border-zalo-emerald/20 bg-zalo-emerald/15 px-2 py-0.5 rounded'>محلولة بنجاح ✅</span>";

        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="font-extrabold text-white">الطلب المرجعي: #${c.orderId}</span>
                ${statB}
            </div>
            <p class="text-white/70 leading-relaxed">${c.message}</p>
        `;
        holder.appendChild(card);
    });
}

// --- Notifications Management ---

function toggleNotificationsModal() {
    alert("الإشعارات المعتمدة للزبون تم التحقق منها وهي نشطة بالكامل وتأتي في شكل تنبيهات!");
}

function updateNotificationBadge() {
    const list = state.notifs.filter(n => n.userId === state.currentUser.id && !n.isRead);
    const badge = document.getElementById('notif-count');
    if (badge) {
        if (list.length > 0) {
            badge.innerText = list.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// --- 2. Merchant dashboard logics ---

function renderMerchantDashboard() {
    const store = state.stores.find(s => s.merchantId === state.currentUser.id);
    const noStoreAlert = document.getElementById('merchant-no-store-alert');
    const storeContainer = document.getElementById('merchant-has-store-container');

    if (!store) {
        if (noStoreAlert) noStoreAlert.classList.remove('hidden');
        if (storeContainer) storeContainer.classList.add('hidden');
        return;
    } else {
        if (noStoreAlert) noStoreAlert.classList.add('hidden');
        if (storeContainer) storeContainer.classList.remove('hidden');
    }

    // Load active subscription plan
    const sub = state.subs.find(s => s.merchantId === state.currentUser.id);
    const planName = sub && sub.status === "ACTIVE" ? sub.planName : "FREE";
    const subBadge = document.getElementById('merchant-sub-badge');
    const statusTextDetail = document.getElementById('current-subscription-status');
    
    if (subBadge) {
        subBadge.innerText = planName === "FREE" ? "باقة مجانية ❌" : `باقة ذكية 💎`;
    }
    if (statusTextDetail) {
        statusTextDetail.innerText = planName === "FREE" ? "الحساب المجاني المحدود" : `مفعل: ${planName}`;
    }

    // Set statistics
    const storeProducts = state.products.filter(p => p.storeId === store.id);
    const storeOrders = state.orders.filter(o => o.storeId === store.id);
    const salesSum = storeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    document.getElementById('merchant-products-count').innerText = storeProducts.length;
    document.getElementById('merchant-orders-count').innerText = storeOrders.length;
    document.getElementById('merchant-sales-total').innerText = `${salesSum.toLocaleString()} DZD`;
    document.getElementById('merchant-pending-orders').innerText = storeOrders.filter(o => o.status === "PENDING").length;

    // Render store active products list table
    const tableBody = document.getElementById('merchant-products-table-body');
    if (tableBody) {
        tableBody.innerHTML = "";
        if (storeProducts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan='5' class='text-center py-4 text-white/55'>لم تقم بعرض وتحميل أي منتج بمتجرك حتى الآن.</td></tr>`;
        } else {
            storeProducts.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 flex items-center gap-2 font-bold text-white">
                        <img src="${p.imageUrl}" class="w-8 h-8 rounded object-cover">
                        ${p.name}
                    </td>
                    <td class="p-3 font-extrabold text-zalo-gold">${p.price.toLocaleString()} DZD</td>
                    <td class="p-3 text-white/70">${p.stock} قطعة</td>
                    <td class="p-3 text-white/50">${p.salesCount} مرة</td>
                    <td class="p-3 text-center">
                        <button onclick="deleteMerchantProduct(${p.id})" class="text-red-400 hover:text-red-500 font-bold px-2 py-1"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // Render Store incoming order items
    const ordersList = document.getElementById('merchant-orders-list');
    if (ordersList) {
        ordersList.innerHTML = "";
        if (storeOrders.length === 0) {
            ordersList.innerHTML = `<p class="text-[11px] text-white/50 text-center py-4">لا توجد طلبات تسليم واردة للمتجر بعد.</p>`;
        } else {
            storeOrders.forEach(o => {
                const item = document.createElement('div');
                item.className = "bg-zalo-navy/70 p-4 border border-white/5 rounded-xl text-xs space-y-3";
                
                let orderControls = "";
                if (o.status === "PENDING") {
                    orderControls = `
                        <button onclick="updateOrderStatus(${o.id}, 'SHIPPING')" class="px-3 py-1.5 bg-zalo-emerald hover:bg-zalo-emeraldDark text-white font-bold rounded-lg transition text-[10px]">تجهيز وشحن الطلب 🚚</button>
                    `;
                } else if (o.status === "SHIPPING") {
                    orderControls = `
                        <button onclick="updateOrderStatus(${o.id}, 'DELIVERED')" class="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition text-[10px]">تأكيد تسليم عامل الديليفري ✅</button>
                    `;
                } else {
                    orderControls = `<span class="text-zalo-emeraldLight font-extrabold"><i class="fa-regular fa-circle-check"></i> مكتمل ومسدد</span>`;
                }

                item.innerHTML = `
                    <div class="flex items-center justify-between border-b border-white/5 pb-2">
                        <div>
                            <span class="font-extrabold text-white text-xs">كود الطلب: #${o.id}</span>
                            <span class="text-[10px] text-white/40 block mt-0.5">التاريخ: ${new Date(o.timestamp).toLocaleString('ar-DZ')}</span>
                        </div>
                        <div class="text-left">
                            <span class="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded">المشتري: زبون ZaLo</span>
                        </div>
                    </div>
                    <div class="text-white/70 space-y-1">
                        <p><strong>العنوان المطلوب للبلدية:</strong> ${o.address}</p>
                        <p><strong>أسلوب تحصيل الدفع:</strong> ${o.paymentMethod === "COD" ? "دفع نقدي عند التسليم" : "التحويل البريدي المعالج"}</p>
                        <p class="text-zalo-gold font-extrabold">المجموع المحول: ${o.totalAmount.toLocaleString()} DZD</p>
                    </div>
                    <div class="flex justify-end pt-2 border-t border-white/5">
                        ${orderControls}
                    </div>
                `;
                ordersList.appendChild(item);
            });
        }
    }
    renderMerchantVerificationStatus();
}

function registerMerchantStore() {
    const name = document.getElementById('setup-store-name').value.trim();
    const desc = document.getElementById('setup-store-desc').value.trim();
    const phone = document.getElementById('setup-store-phone').value.trim() || "+213555123456";
    const whatsapp = document.getElementById('setup-store-whatsapp').value.trim() || "213555123456";
    const wilaya = document.getElementById('setup-store-wilaya').value;
    const commune = document.getElementById('setup-store-commune').value.trim() || "الجزائر";
    const category = document.getElementById('setup-store-cat').value;

    if (!name || !desc) {
        alert("يرجى تعبئة اسم المتجر ووصف غني وصحيح للزبون.");
        return;
    }

    const newStore = {
        id: 100 + state.stores.length + 1,
        merchantId: state.currentUser.id,
        name: name,
        description: desc,
        phone: phone,
        whatsapp: whatsapp,
        wilaya: wilaya,
        commune: commune,
        category: category,
        status: "APPROVED", // Auto-approved for frictionless web simulation!
        rating: 4.8
    };

    state.stores.push(newStore);
    updateDatabaseState();

    logAudit(state.currentUser.name, "REGISTER_STORE", `Created new vendor store: ${name}`);
    addNotification(state.currentUser.id, "تسجيل المتجر 🏬", `تهانينا! تم تفعيل متجرك الجزائري (${name}) للبدء بتلقي الأرباح.`);
    
    renderMerchantDashboard();
}

function selectUpgradePlan(planName, price) {
    // Add pending payment subscription
    const existing = state.subs.find(s => s.merchantId === state.currentUser.id);
    if (existing) {
        existing.planName = planName;
        existing.status = "ACTIVE"; // Frictionless activation!
        existing.price = price;
    } else {
        state.subs.push({
            id: Date.now(),
            merchantId: state.currentUser.id,
            planName: planName,
            status: "ACTIVE",
            price: price,
            paymentReceiptUrl: "BaridiMobReceipt-" + Math.floor(Math.random() * 9000) + ".png",
            startDate: Date.now(),
            endDate: Date.now() + 30 * 86400000
        });
    }

    updateDatabaseState();
    renderMerchantDashboard();
    logAudit(state.currentUser.name, "PAY_SUBSCRIPTION", `Submited ccp receipt and activated license: ${planName}`);
    showToastNotification(`تم الترقية للاشتراك ${planName}!`);
}

function toggleAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.toggle('hidden');
}

function openAddProductModal() {
    toggleAddProductModal();
}

function submitMerchantProduct() {
    const name = document.getElementById('prod-name').value.trim();
    const desc = document.getElementById('prod-desc').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value) || 1200;
    const stock = parseInt(document.getElementById('prod-stock').value) || 5;
    const category = document.getElementById('prod-cat').value;
    const img = document.getElementById('prod-img').value;

    const store = state.stores.find(s => s.merchantId === state.currentUser.id);
    if (!store) return;

    if (!name || !desc) {
        alert("يرجى ملء جميع الحقول لإقناع المشترين بالمنتج.");
        return;
    }

    const newProd = {
        id: 1000 + state.products.length + 1,
        storeId: store.id,
        name: name,
        description: desc,
        price: price,
        category: category,
        stock: stock,
        salesCount: 0,
        rating: 4.5,
        imageUrl: img
    };

    state.products.push(newProd);
    updateDatabaseState();

    toggleAddProductModal();
    renderMerchantDashboard();

    logAudit(store.name, "ADD_PRODUCT", `Added product to catalog: ${name}`);
    showToastNotification("تم إضافة المنتج للمتجر بنجاح!");
}

function deleteMerchantProduct(prodId) {
    state.products = state.products.filter(p => p.id !== prodId);
    updateDatabaseState();
    renderMerchantDashboard();
    showToastNotification("تم مسح المنتج من متجركم.");
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        updateDatabaseState();
        renderMerchantDashboard();
        
        // Notify customer
        addNotification(order.customerId, "حالة شحن طلبك 🚚", `قام البائع بتحديث طلبك المرجعي #${orderId} ليصبح بحالة: ${newStatus}`);
        logAudit(state.currentUser.name, "UPDATE_ORDER", `Set state of order #${orderId} to ${newStatus}`);
    }
}

// --- 3. ADMIN PORTAL LOGICS ---

function renderAdminDashboard() {
    // Collect statistics
    document.getElementById('admin-stat-users').innerText = state.users.length;
    document.getElementById('admin-stat-stores').innerText = state.stores.filter(s => s.status === "PENDING").length;
    document.getElementById('admin-stat-subs').innerText = state.subs.filter(s => s.status === "PENDING_VERIFICATION").length;
    document.getElementById('admin-stat-support').innerText = state.complaints.filter(c => c.status === "PENDING").length;

    // Build pending stores table
    const storeBody = document.getElementById('admin-pending-stores-tbody');
    if (storeBody) {
        storeBody.innerHTML = "";
        
        const pendingStores = state.stores; // Let Admin manage all stores for full flexibility!
        if (pendingStores.length === 0) {
            storeBody.innerHTML = `<tr><td colspan='5' class='text-center py-4 text-white/55'>لا توجد متاجر مسجلة بالنظام للمراجعة حالياً.</td></tr>`;
        } else {
            pendingStores.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 font-bold text-white">${s.name} <p class="text-[10px] text-white/50 font-normal mt-0.5">${s.description}</p></td>
                    <td class="p-3 text-white/70">${s.wilaya} – ${s.commune}</td>
                    <td class="p-3 text-zalo-goldLight">${translateCategory(s.category)}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] uppercase ${s.status === 'APPROVED' ? 'bg-zalo-emerald/20 text-zalo-emeraldLight border border-zalo-emerald/30' : 'bg-zalo-gold/20 text-zalo-gold border border-zalo-gold/30'}">
                            ${s.status}
                        </span>
                    </td>
                    <td class="p-3 text-center space-x-1 space-x-reverse min-w-[120px]">
                        ${s.status !== 'APPROVED' ? 
                            `<button onclick="moderateStore(${s.id}, 'APPROVED')" class="bg-zalo-emerald hover:bg-zalo-emeraldDark text-white px-2 py-1 text-[10px] font-bold rounded">قبول ✅</button>` : 
                            `<button onclick="moderateStore(${s.id}, 'SUSPENDED')" class="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-2 py-1 text-[10px] font-bold rounded">تبريد 🚫</button>`
                        }
                    </td>
                `;
                storeBody.appendChild(tr);
            });
        }
    }

    // Build merchant upgrades payments table
    const subsBody = document.getElementById('admin-pending-subs-tbody');
    if (subsBody) {
        subsBody.innerHTML = "";
        const allSubs = state.subs;
        if (allSubs.length === 0) {
            subsBody.innerHTML = `<tr><td colspan='5' class='text-center py-4 text-white/55'>لم يرسل أي تاجر طلب تحويل CCP للترقية بعد.</td></tr>`;
        } else {
            allSubs.forEach(su => {
                const innerUser = state.users.find(u => u.id === su.merchantId);
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 font-bold text-white">${innerUser ? innerUser.name : "تاجر ZaLo"}</td>
                    <td class="p-3 text-zalo-goldLight font-bold">${su.planName}</td>
                    <td class="p-3 font-mono font-black text-zalo-gold">${su.price.toLocaleString()} DZD</td>
                    <td class="p-3 font-mono"><span class="underline text-blue-400 select-all cursor-pointer">${su.paymentReceiptUrl}</span></td>
                    <td class="p-3 text-center">
                        ${su.status === 'PENDING_VERIFICATION' ?
                            `<button onclick="approveSubscription(${su.id})" class="bg-zalo-emerald hover:bg-zalo-emeraldDark text-white px-3 py-1 rounded text-[10px] font-bold transition">تفعيل وتنشيط 📂</button>` :
                            `<span class="text-zalo-emeraldLight text-[10px] font-medium"><i class="fa-solid fa-circle-check"></i> مفعل بالكامل</span>`
                        }
                    </td>
                `;
                subsBody.appendChild(tr);
            });
        }
    }

    // Build Admin Complaints and helpdesk desk
    const compBody = document.getElementById('admin-complaints-tbody');
    if (compBody) {
        compBody.innerHTML = "";
        const complaintsList = state.complaints;
        if (complaintsList.length === 0) {
            compBody.innerHTML = `<tr><td colspan='4' class='text-center py-4 text-white/55'>سجل الشكاوى فارغ والتقييمات ممتازة ونظيفة!</td></tr>`;
        } else {
            complaintsList.forEach(co => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 font-bold text-white">الطلب #${co.orderId} <p class="text-[10px] text-white/50 mt-0.5">الشاكي: ${co.userName}</p></td>
                    <td class="p-3 text-white/80 leading-relaxed">${co.message}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-[10px] ${co.status === 'RESOLVED' ? 'bg-zalo-emerald/10 text-zalo-emeraldLight border border-zalo-emerald/30' : 'bg-red-400/20 text-red-400 border border-red-500/30'}">
                            ${co.status}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        ${co.status !== 'RESOLVED' ?
                            `<button onclick="resolveComplaint(${co.id})" class="bg-zalo-emerald/20 hover:bg-zalo-emerald hover:text-white border border-zalo-emeraldLight/30 text-zalo-emeraldLight px-3 py-1 rounded text-[10px] font-bold">حل وإغلاق النزاع 🛡️</button>` :
                            `<span class="text-white/40 text-[10px]">مكتملة</span>`
                        }
                    </td>
                `;
                compBody.appendChild(tr);
            });
        }
    }

    // Build pending verifications table
    const verifBody = document.getElementById('admin-pending-verifications-tbody');
    if (verifBody) {
        verifBody.innerHTML = "";
        const allVerifs = state.verifications || [];
        if (allVerifs.length === 0) {
            verifBody.innerHTML = `<tr><td colspan='5' class='text-center py-4 text-white/55'>لا توجد طلبات توثيق هوية قيد الانتظار حالياً.</td></tr>`;
        } else {
            allVerifs.forEach(v => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 font-bold text-white">${v.merchantName}</td>
                    <td class="p-3 font-mono text-zalo-gold font-semibold">${v.commercialRegisterCode}</td>
                    <td class="p-3 font-mono text-white/80">${v.nationalIdNumber}</td>
                    <td class="p-3 space-x-1 space-x-reverse text-[10px]">
                        <span class="underline text-blue-400 cursor-pointer select-all font-mono">${v.nationalIdCardFileUrl}</span>
                        <span class="text-white/30">|</span>
                        <span class="underline text-purple-400 cursor-pointer select-all font-mono">${v.commercialRegisterFileUrl}</span>
                    </td>
                    <td class="p-3 text-center">
                        ${!v.isVerified ?
                            `<button onclick="approveMerchantVerification(${v.id})" class="bg-zalo-emerald hover:bg-zalo-emeraldDark text-white px-3 py-1 rounded text-[10px] font-bold transition shadow">مصادقة وتوثيق 🏢</button>` :
                            `<span class="text-zalo-emeraldLight text-[10px] font-bold"><i class="fa-solid fa-shield-halved"></i> بائع معتمد</span>`
                        }
                    </td>
                `;
                verifBody.appendChild(tr);
            });
        }
    }

    renderAuditLogs();
}

function moderateStore(storeId, newStatus) {
    const store = state.stores.find(s => s.id === storeId);
    if (store) {
        store.status = newStatus;
        updateDatabaseState();
        renderAdminDashboard();
        
        addNotification(store.merchantId, "حالة الطلب للمتجر 🛡️", `تم تحديث حالة متجرك (${store.name}) إلى: ${newStatus}`);
        logAudit(state.currentUser.name, "MODERATE_STORE", `Set moderation status of store #${storeId} to ${newStatus}`);
    }
}

function approveSubscription(subId) {
    const sub = state.subs.find(s => s.id === subId);
    if (sub) {
        sub.status = "ACTIVE";
        updateDatabaseState();
        renderAdminDashboard();
        
        addNotification(sub.merchantId, "تفعيل الترخيص 💎", `مبروك! تم تفعيل اشتراكك التابع لخطة ${sub.planName} بنجاح كلي بعد مراجعة وصل CCP.`);
        logAudit(state.currentUser.name, "APPROVE_SUBSCRIPTION", `Approved subscription upgrade license #${subId}`);
    }
}

function resolveComplaint(compId) {
    const complaint = state.complaints.find(c => c.id === compId);
    if (complaint) {
        complaint.status = "RESOLVED";
        updateDatabaseState();
        renderAdminDashboard();
        
        addNotification(complaint.userId, "حل الشكوى والنزاع 🛡️", `تمت دراسة وحل شكواك للطلب #${complaint.orderId} من قبل مشرفي المنصة بنجاح.`);
        logAudit(state.currentUser.name, "RESOLVE_COMPLAINT", `Resolved dispute ticket #${compId} for order #${complaint.orderId}`);
    }
}

function renderAuditLogs() {
    const container = document.getElementById('admin-audit-logs');
    if (!container) return;

    container.innerHTML = "";
    state.auditLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = "bg-zalo-navy/90 p-2.5 rounded border border-white/5 leading-relaxed";
        
        const timestampStr = new Date(log.timestamp).toLocaleTimeString('ar-DZ');
        div.innerHTML = `
            <div class="flex items-center justify-between text-[9px] text-white/40 mb-1">
                <span>[${log.action}]</span>
                <span>${timestampStr}</span>
            </div>
            <div>
                <span class="text-zalo-gold font-bold">${log.actorName}:</span> ${log.details}
            </div>
        `;
        container.appendChild(div);
    });
}

function clearAndSeedAppDatabase() {
    if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط قاعدة البيانات وحذف جميع الطلبات والمتاجر المعدلة والمحاكاة؟")) {
        localStorage.clear();
        loadStateFromStorage();
        renderAdminDashboard();
        showToastNotification("تم إعادة تهيئة قاعدة البيانات الافتراضية.");
    }
}

// --- 4. GEMINI WEB COMPANION CHAT SYSTEM ---

let chatHistory = [
    { sender: "assistant", text: "مرحباً بك في مساعد سوق الجزائر الذكي (ZaLo Smart Companion) 🤖\nيمكنني مساعدتك في الشراء الآمن، تتبع الموصلين، أو تزويدك بخبرة تسعير منتجك بالعملة المحلية CCP وبدء تجارتك الإلكترونية. كيف أخدمك اليوم؟" }
];

function renderAiChatMessages() {
    const container = document.getElementById('ai-chat-messages-container');
    if (!container) return;

    container.innerHTML = "";
    chatHistory.forEach(msg => {
        const row = document.createElement('div');
        row.className = `flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-3`;
        
        const bubbleBg = msg.sender === 'user' ? 'bg-zalo-emerald text-white' : 'bg-zalo-navyLight text-white/90 border border-white/10';
        const formattedText = msg.text.replace(/\*(.*?)\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");

        row.innerHTML = `
            <div class="max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${bubbleBg}">
                ${formattedText}
            </div>
        `;
        container.appendChild(row);
    });

    // Auto scroll bottom
    container.scrollTop = container.scrollHeight;
}

function sendUserMessageToAssistant() {
    const input = document.getElementById('ai-chat-input-text');
    if (!input) return;

    const userMsg = input.value.trim();
    if (!userMsg) return;

    // Send msg
    chatHistory.push({ sender: "user", text: userMsg });
    input.value = "";
    renderAiChatMessages();

    // Show AI generating message bubble
    chatHistory.push({ sender: "assistant", text: "جاري تحليل الاستفسار ومراجعة الأسواق الجزائرية..." });
    renderAiChatMessages();

    // Simulate API Response or query directly if integrated
    setTimeout(() => {
        // Pop loading bubble
        chatHistory.pop();
        
        // Write responses according to words
        let answer = "يسرني مساعدتك في سوق الجزائر الذكي! المنصة ممتازة جداً وتدعم الدفع عبر بريدي موب كلياً. لمزيد من التحليلات المعمقة يرجى ربط حسابك بـ Gemini API Key في لوحة تحويل الإعدادات الذكية.";
        const low = userMsg.toLowerCase();
        
        if (low.includes("سعر") || low.includes("أبيع") || low.includes("تاجر")) {
            answer = "للبدء كتاجر ناجح في الجزائر، ننصحك بدراسة أسعار الهواتف المتوفرة بالمنصة، والاعتماد على تسليم فوري مع تخفيض في الولايات مثل *وهران* و*سطيف*، كما يمكنك تفعيل اشتراك **Smart Enterprise** بقيمة 4,500 دج لمنتجات لا محدودة.";
        } else if (low.includes("شراء") || low.includes("دفع") || low.includes("ccp") || low.includes("بريدي")) {
            answer = "عمليات الشراء بالمنصة سهلة جداً! يمكنك الشراء بضمان **الدفع عند الاستلام (COD)** كخيار مفضل للأمان، أو التحويل البريدي السريع **بريدي موب BaridiMob** برقم الـ RIP المسجل وتأكيد طلبك للمورد الذكي فوراً.";
        } else if (low.includes("مرحباً") || low.includes("سلام") || low.includes("اهلين")) {
            answer = "أهلاً بك زبوننا العزيز في ZaLo! 🇩🇿\nكيف يمكنني مساعدتك في استعراض التصنيفات أو تتبع شحنتك اليوم؟";
        }

        chatHistory.push({ sender: "assistant", text: answer });
        renderAiChatMessages();
    }, 1200);
}

// --- Merchant assistance AI Assistant Panel Inside Store Manager ---

let merchantAiHistory = [
    { sender: "assistant", text: "أهلاً بك يا شريك النجاح! 🏬\nأنا مستشارك المالي والتسويقي التلقائي. اسألني عن أفضل السلع في الجزائر أو طريقة كتابة وصف جذاب." }
];

function sendMerchantAiMessage() {
    const input = document.getElementById('merchant-ai-chat-input');
    if (!input) return;

    const val = input.value.trim();
    if (!val) return;

    // Push message
    merchantAiHistory.push({ sender: "user", text: val });
    input.value = "";
    renderMerchantAiHistory();

    // Loading
    merchantAiHistory.push({ sender: "assistant", text: "تفحص قواعد السوق..." });
    renderMerchantAiHistory();

    setTimeout(() => {
        merchantAiHistory.pop();
        
        let answer = "للوصول لأعلى عائد تسويقي في منصة ZaLo، قم بنشر السلع بمواصفات حقيقية، واستخدم باقة **Smart Enterprise** لتحليلات السلع النشطة لتزيد مبيعاتك لأكثر من 40% هذا الشهر.";
        if (val.includes("وصف") || val.includes("منتج")) {
            answer = "إليك نموذج وصف جذاب:\n'اكتشف الجودة العالية المصممة لتلائم عائلتك بضمان حصري وتوصيل مخفض لكافة البلديات. اطلبها الآن ببنود دفع آمنة.'";
        } else if (val.includes("توصيل") || val.includes("بريد")) {
            answer = "البريد الجزائري CCP وتطبيق بريدي موب هما الأسرع للتعاملات الكبرى بالعملة المحلية DZD. ننصحك بنشر رقم RIP التاجر للزبون وتوفير تذكرة وصل CCP مع عامل الاستلام.";
        }

        merchantAiHistory.push({ sender: "assistant", text: answer });
        renderMerchantAiHistory();
    }, 1200);
}

function renderMerchantAiHistory() {
    const container = document.getElementById('merchant-ai-chat-history');
    if (!container) return;

    container.innerHTML = "";
    merchantAiHistory.forEach(msg => {
        const div = document.createElement('div');
        div.className = "p-2.5 rounded-xl text-xs space-y-1 mb-2 " + 
            (msg.sender === 'user' ? 'bg-zalo-emerald text-white text-left self-end mr-6' : 'bg-zalo-navy/90 text-white/80 border border-white/5');
        
        div.innerHTML = msg.text.replace(/\n/g, "<br>");
        container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
}

// --- Dynamic AI recommendation updates ---

function refreshAiRecommendations() {
    const box = document.getElementById('ai-recom-text');
    if (!box) return;

    box.innerText = "جاري الاتصال بمجالس تحليل البيانات لموقع الجزائر...";
    setTimeout(() => {
        const picked = AI_شॉपिंग_توصيات[Math.floor(Math.random() * AI_شॉपिंग_توصيات.length)];
        box.innerHTML = picked.replace(/\*(.*?)\/g, "<strong>$1</strong>");
    }, 1000);
}

function clearChatHistory() {
    chatHistory = [
        { sender: "assistant", text: "تم تصفير المحادثة. كيف يمكنني مساعدتك في عمليات الشراء أو لوحة التاجر اليوم؟" }
    ];
    renderAiChatMessages();
}

function openDownloadModal() {
    const modal = document.getElementById('download-helper-modal');
    if (modal) modal.classList.remove('hidden');
}

function toggleDownloadModal() {
    const modal = document.getElementById('download-helper-modal');
    if (modal) modal.classList.add('hidden');
}

// --- 5. Merchant Identity Verification Workflow ---

let simulatedFiles = {
    national_id: null,
    commercial_register: null
};

function simulateFileUpload(fileType) {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    if (fileType === 'national_id') {
        simulatedFiles.national_id = `nid-${randomId}.png`;
        const lbl = document.getElementById('lbl-id-file');
        if (lbl) {
            lbl.innerText = `مرفق: nid-${randomId}.png`;
            lbl.classList.remove('text-white/60');
            lbl.classList.add('text-zalo-emeraldLight', 'font-bold');
        }
    } else if (fileType === 'commercial_register') {
        simulatedFiles.commercial_register = `cr-${randomId}.pdf`;
        const lbl = document.getElementById('lbl-cr-file');
        if (lbl) {
            lbl.innerText = `مرفق: cr-${randomId}.pdf`;
            lbl.classList.remove('text-white/60');
            lbl.classList.add('text-zalo-gold', 'font-bold');
        }
    }
    showToastNotification("تم محاكاة رفع المستند بنجاح!");
}

function submitMerchantVerificationDocuments() {
    const registerCode = document.getElementById('verify-register-code').value.trim();
    const ninCode = document.getElementById('verify-nin-code').value.trim();

    if (!registerCode || !ninCode) {
        alert("يرجى إدخال السجل الإلكتروني ورقم التعريف الوطني NIN أولاً.");
        return;
    }

    if (!simulatedFiles.national_id || !simulatedFiles.commercial_register) {
        alert("يرجى الضغط على أزرار رفع الملفات الرسمية المرفقة لتوليد الأوراق وتجربتها.");
        return;
    }

    // Create entry
    const newVerif = {
        id: Date.now(),
        merchantId: state.currentUser.id,
        merchantName: state.currentUser.name,
        commercialRegisterCode: registerCode,
        nationalIdNumber: ninCode,
        commercialRegisterFileUrl: simulatedFiles.commercial_register,
        nationalIdCardFileUrl: simulatedFiles.national_id,
        isVerified: false,
        submittedAt: Date.now()
    };

    state.verifications.push(newVerif);
    updateDatabaseState();

    // Log action & notify
    logAudit(state.currentUser.name, "UPLOAD_DOCUMENTS", `Submitted identity & CR verification files for official review`);
    addNotification(state.currentUser.id, "تدقيق أوراق المتجر 🛡️", "تم تسليم بطاقة الهوية الرقمية ورقم السجل. قيد المعاينة والمصادقة خلال دقائق.");

    // Update view
    renderMerchantVerificationStatus();
    showToastNotification("تم إرسال الملفات الرسمية للإدارة!");
}

function renderMerchantVerificationStatus() {
    const badge = document.getElementById('merchant-verify-badge');
    const unverifiedBlock = document.getElementById('merchant-verify-unverified-block');
    const submittedBlock = document.getElementById('merchant-verify-submitted-block');

    if (!badge) return;

    const myVerif = state.verifications.find(v => v.merchantId === state.currentUser.id);

    if (!myVerif) {
        // Unverified, show form
        badge.innerText = "غير موثق ❌";
        badge.className = "text-[9px] bg-red-400/15 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold";
        if (unverifiedBlock) unverifiedBlock.classList.remove('hidden');
        if (submittedBlock) submittedBlock.classList.add('hidden');
    } else if (!myVerif.isVerified) {
        // Submitted, waiting
        badge.innerText = "قيد المراجعة ⏳";
        badge.className = "text-[9px] bg-zalo-gold/15 text-zalo-gold px-2.5 py-0.5 rounded-full border border-zalo-gold/30 font-bold animate-pulse";
        if (unverifiedBlock) unverifiedBlock.classList.add('hidden');
        if (submittedBlock) submittedBlock.classList.remove('hidden');
    } else {
        // Fully verified!
        badge.innerText = "بائع معتمد 🛡️";
        badge.className = "text-[9px] bg-zalo-emerald/15 text-zalo-emeraldLight px-2.5 py-0.5 rounded-full border border-zalo-emerald/30 font-bold";
        if (unverifiedBlock) unverifiedBlock.classList.add('hidden');
        
        if (submittedBlock) {
            submittedBlock.innerHTML = `
                <div class="p-3 bg-zalo-emerald/10 border border-zalo-emerald/20 rounded-xl space-y-1 text-center">
                    <i class="fa-solid fa-circle-check text-zalo-emeraldLight text-lg"></i>
                    <p class="font-bold text-white text-xs">حساب التاجر موثق ونشط 🛡️</p>
                    <p class="text-[9px] text-white/60">تم ربط السجل الإلكتروني وبطاقة التعريف بنجاح. شارتك ظاهرة للزبائن لزيادة المبيعات والاطمئنان.</p>
                </div>
            `;
            submittedBlock.classList.remove('hidden');
        }
    }
}

function approveMerchantVerification(verifId) {
    const verif = state.verifications.find(v => v.id === verifId);
    if (verif) {
        verif.isVerified = true;
        
        updateDatabaseState();
        renderAdminDashboard();
        
        addNotification(verif.merchantId, "توثيق رسمي مقبول 🛡️", "مبروك! تمت مصادقة أوراقك وصدرت شهادة 'بائع معتمد' الخاصة بمتجرك بنجاح.");
        logAudit(state.currentUser.name, "VERIFY_MERCHANT", `Approved official identity verification files for merchant #${verif.merchantId}`);
        showToastNotification("تم توثيق التاجر بنجاح!");
    }
}

// --- App Initialization Setup ---
window.onload = function() {
    loadStateFromStorage();
    updateCartCountBadge();
    updateNotificationBadge();
    
    // Set view initially
    setRole("CUSTOMER");
};
