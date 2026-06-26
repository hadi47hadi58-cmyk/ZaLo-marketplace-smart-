-- =====================================================================
-- ZaLo Marketplace Smart Database Schema (PostgreSQL)
-- مخطط قاعدة بيانات سوق الجزائر الذكي - هيكلة إنتاجية متكاملة بـ 58 ولاية
-- =====================================================================

-- Safe clean up of existing tables and types (to allow clean re-runs)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payment_proofs CASCADE;
DROP TABLE IF EXISTS order_lifecycle CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS merchant_documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS sub_status CASCADE;
DROP TYPE IF EXISTS sub_plan CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS store_status CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 1. ENUMS AND CUSTOM TYPES (أنواع مخصصة للمنصة)
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'MERCHANT', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE store_status AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'DISPUTED');
CREATE TYPE payment_method AS ENUM ('COD', 'BARIDIMOB', 'CCP');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE sub_plan AS ENUM ('STARTER_COMPACT', 'SMART_ENTERPRISE');
CREATE TYPE sub_status AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED');
CREATE TYPE ticket_status AS ENUM ('PENDING', 'RESOLVED', 'CLOSED');

-- 2. USERS & PROFILES (المستخدمين والحسابات الشخصية)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER'::user_role,
    status user_status DEFAULT 'ACTIVE'::user_status,
    wilaya VARCHAR(100) NOT NULL, -- واحدة من 58 ولاية جزائرية
    commune VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. MERCHANT DOCUMENTS & VERIFICATION FLOW (أوراق التحقق الخاصة بالتجار)
CREATE TABLE merchant_documents (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    national_id_card_url VARCHAR(255), -- صورة بطاقة التعريف الوطنية البيومترية
    commercial_register_code VARCHAR(100), -- رقم السجل التجاري الإلكتروني
    commercial_register_pdf_url VARCHAR(255), -- ملف السجل التجاري بصيغة PDF
    payment_receipt_url VARCHAR(255), -- إثبات دفع التراخيص (BaridiMob-CCP)
    is_verified BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    notes TEXT
);

-- 4. STORES / SHOPS (المتاجر وبوابات التحكم الخاصة بالبائعين)
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    wilaya VARCHAR(100) NOT NULL,
    commune VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g. ELECTRONICS, FOOD, FASHION
    status store_status DEFAULT 'PENDING_APPROVAL'::store_status,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS CATALOG & STOCK TRACKING (السلع والمنتجات ومراقبة المخزن)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL, -- بالدينار الجزائري DZD
    category VARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDERS & TRANSACTIONS (الطلبات والمعاملات المالية)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    store_id INT REFERENCES stores(id) ON DELETE SET NULL,
    status order_status DEFAULT 'PENDING'::order_status,
    total_amount NUMERIC(12,2) NOT NULL,
    delivery_fee NUMERIC(8,2) DEFAULT 400.00, -- تسعيرة التوصيل الافتراضية
    payment_method payment_method NOT NULL DEFAULT 'COD'::payment_method,
    payment_status payment_status DEFAULT 'PENDING'::payment_status,
    delivery_address TEXT NOT NULL,
    delivery_wilaya VARCHAR(100) NOT NULL,
    delivery_commune VARCHAR(150) NOT NULL,
    tracking_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- 6b. PAYMENT PROOFS (إثباتات الدفع بالمنصة)
CREATE TABLE payment_proofs (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    receipt_image_url VARCHAR(255) NOT NULL, -- رابط إثبات الدفع المرفوع (بريديموب / CCP)
    amount NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6c. ORDER LIFECYCLE TRACKING (سجل تتبع الشحنات وحركة البضاعة)
CREATE TABLE order_lifecycle (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    notes TEXT,
    updated_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. REVIEWS & RATINGS (التقييمات ومراجعات الجودة للسلع)
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. COMPLAINTS & DISPUTE RESOLUTION (شكاوى النزاعات وحماية المستهلك)
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- المستهلك المشتكي
    user_name VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status ticket_status DEFAULT 'PENDING'::ticket_status,
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 9. PREMIUM SUBSCRIPTIONS (الاشتراكات المميزة للتجار والدفع بـ CCP / BaridiMob)
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    plan_name sub_plan NOT NULL,
    status sub_status DEFAULT 'PENDING'::sub_status,
    price NUMERIC(10,2) NOT NULL,
    payment_receipt_url VARCHAR(255) NOT NULL, -- ملف كشف الدفع أو المرسل
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SYSTEM NOTIFICATIONS (الإشعارات الذكية للمستخدمين)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS (سجل العمليات الإدارية وتدقيق الحسابات لمنع التلاعب)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_name VARCHAR(150) NOT NULL, -- اسم المتدخل (مشرف، تاجر، نظام تلقائي)
    action VARCHAR(100) NOT NULL,   -- طبيعة العملية (LOGIN, CREATE_PRODUCT, APPROVE_STORE)
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TRIGGERS & PROCEDURES (الإضافات التلقائية لسجلات التدقيق)
CREATE OR REPLACE FUNCTION log_store_approvals_proc() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO audit_logs (actor_name, action, details)
        VALUES ('System Trigger', 'STORE_STATUS_UPDATE', 
                'تم تعديل حالة المتجر (' || NEW.name || ') من ' || OLD.status || ' إلى ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_store_approvals_trigger
AFTER UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION log_store_approvals_proc();

-- 13. INDEXING FOR HIGH PERFORMANCE (فهرسة البيانات لأداء صاروخي وقت الضغط)
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_wilaya ON stores(wilaya);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
