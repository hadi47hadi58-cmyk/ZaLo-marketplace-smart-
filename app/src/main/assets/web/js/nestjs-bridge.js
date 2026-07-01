// ZaLo Smart Marketplace - NestJS Backend REST API Bridge
// جسر الاتصال البرمجي الموحد بين الواجهة الأمامية والخلفية لـ NestJS وقاعدة بيانات PostgreSQL
// يدعم التبديل التلقائي والحفظ الاحتياطي في الـ LocalStorage لضمان تشغيل أوفلاين متين وسلس.

const NESTJS_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://zalo-smart-backend-service-api.run.app/api'; // رابط الإنتاج الافتراضي في السحابة

console.log(`[ZaLo Bridge] تم إعداد جسر الاتصال بـ NestJS على المسار: ${NESTJS_BASE_URL}`);

/**
 * دالة مساعدة لتنفيذ الطلبات مع معالجة الأخطاء والرجوع التلقائي للبيانات المحلية
 */
async function nestFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${NESTJS_BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `خطأ في استجابة الخادم: ${response.status}`);
    }
    return result;
  } catch (err) {
    console.warn(`[ZaLo Bridge] فشل الاتصال بالواجهة الخلفية لـ NestJS (${endpoint}). التفاصيل:`, err.message);
    throw err;
  }
}

/**
 * 1. تسجيل الدخول عبر NestJS
 */
export async function nestjsLogin(email, password) {
  try {
    const result = await nestFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result && result.access_token) {
      // حفظ التوكن محلياً للطلبات المستقبلية
      localStorage.setItem('nestjs_token', result.access_token);
      localStorage.setItem('nestjs_user', JSON.stringify(result.user));
      console.log('✨ [ZaLo Bridge] تم تسجيل الدخول وحفظ التوكن لـ NestJS بنجاح.');
      return result;
    }
  } catch (err) {
    console.error('[ZaLo Bridge] فشل تسجيل الدخول عبر NestJS:', err);
    throw err;
  }
}

/**
 * 2. تسجيل حساب جديد عبر NestJS
 */
export async function nestjsRegister(name, email, password, role, wilaya, commune, phone = '') {
  try {
    const payload = {
      name,
      email,
      password,
      role: role.toUpperCase(), // CUSTOMER, MERCHANT, ADMIN
      wilaya,
      commune,
      phone: phone || undefined,
    };

    const result = await nestFetch('auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    console.log('✨ [ZaLo Bridge] تم إنشاء الحساب بنجاح عبر NestJS.');
    return result;
  } catch (err) {
    console.error('[ZaLo Bridge] فشل إنشاء الحساب عبر NestJS:', err);
    throw err;
  }
}

/**
 * 3. جلب السلع من NestJS
 */
export async function nestjsGetProducts() {
  try {
    const result = await nestFetch('products');
    if (result && result.data) {
      // تحديث الكاش المحلي بالسلع القادمة من الواجهة الخلفية
      localStorage.setItem('zalo_products', JSON.stringify(result.data));
      return result.data;
    }
  } catch (err) {
    console.warn('[ZaLo Bridge] تعذر جلب السلع من NestJS، جاري جلب السلع المخزنة محلياً...');
    // استرجاع الكاش المحلي في حال الفشل
    return JSON.parse(localStorage.getItem('zalo_products') || '[]');
  }
}

/**
 * 4. إضافة منتج جديد (للتجار) عبر NestJS
 */
export async function nestjsCreateProduct(productData) {
  try {
    const token = localStorage.getItem('nestjs_token');
    if (!token) throw new Error('يرجى تسجيل الدخول أولاً لإضافة منتج');

    const result = await nestFetch('products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData),
    });

    console.log('✨ [ZaLo Bridge] تم إضافة المنتج بنجاح عبر NestJS.');
    return result.data;
  } catch (err) {
    console.error('[ZaLo Bridge] فشل إضافة المنتج عبر NestJS:', err);
    throw err;
  }
}

/**
 * 5. جلب الطلبات عبر NestJS
 */
export async function nestjsGetOrders() {
  try {
    const token = localStorage.getItem('nestjs_token');
    if (!token) throw new Error('يرجى تسجيل الدخول أولاً لجلب الطلبيات');

    const result = await nestFetch('orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return result;
  } catch (err) {
    console.error('[ZaLo Bridge] فشل جلب الطلبات عبر NestJS:', err);
    throw err;
  }
}

/**
 * 6. إنشاء طلب شراء جديد عبر NestJS
 */
export async function nestjsCreateOrder(orderData) {
  try {
    const token = localStorage.getItem('nestjs_token');
    if (!token) throw new Error('يرجى تسجيل الدخول أولاً لإكمال الطلب');

    const result = await nestFetch('orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData),
    });

    console.log('✨ [ZaLo Bridge] تم إرسال الطلبية بنجاح وتأسيسها في قاعدة بيانات NestJS.');
    return result;
  } catch (err) {
    console.error('[ZaLo Bridge] فشل إرسال الطلبية عبر NestJS:', err);
    throw err;
  }
}

/**
 * 7. جلب الملف الشخصي والمكافآت للمستخدم الحالي عبر NestJS
 */
export async function nestjsGetProfile() {
  try {
    const token = localStorage.getItem('nestjs_token');
    if (!token) return null;

    const result = await nestFetch('users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (result && result.data) {
      localStorage.setItem('nestjs_user', JSON.stringify(result.data));
      return result.data;
    }
  } catch (err) {
    console.error('[ZaLo Bridge] فشل جلب الملف الشخصي عبر NestJS:', err);
    return JSON.parse(localStorage.getItem('nestjs_user') || 'null');
  }
}

// توفير الجسر برمجياً للوصول إليه من جميع أجزاء التطبيق والصفحات
window.ZaLoBridge = {
  nestjsLogin,
  nestjsRegister,
  nestjsGetProducts,
  nestjsCreateProduct,
  nestjsGetOrders,
  nestjsCreateOrder,
  nestjsGetProfile,
};
