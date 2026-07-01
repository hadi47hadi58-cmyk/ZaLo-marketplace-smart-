// ZaLo Smart Marketplace - Supabase & NestJS Unified Compatibility Layer
// This file acts as a drop-in replacement for the Firebase modular SDK,
// routing all operations completely and cleanly through Supabase AND our NestJS + PostgreSQL Backend.

import { supabase } from './supabase-config.js';
import { telemetry } from './telemetry-logger.js';

export { supabase, telemetry };

// 1. Core / Initializers
export function initializeApp() {
    return { name: "ZaLo-Unified-Compat" };
}

export function getAuth() {
    return { name: "ZaLo-Unified-Auth-Compat" };
}

export function getFirestore() {
    return { name: "ZaLo-Unified-Db-Compat" };
}

export const serverTimestamp = () => new Date().toISOString();

// Dummy Auth Provider for import compatibility
export class GoogleAuthProvider {
    static credential(token) { return { token }; }
}

// NestJS Configuration
const NESTJS_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://zalo-smart-backend-service-api.run.app/api';

console.log(`[ZaLo Compat Engine] Bridge initialized. NestJS API Endpoint: ${NESTJS_BASE_URL}`);

// Helper to make fetch calls to NestJS
async function callNestApi(endpoint, method = 'GET', body = null, token = null) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${NESTJS_BASE_URL}/${endpoint}`, options);
        if (response.ok) {
            return await response.json();
        }
        console.warn(`[ZaLo Compat Engine] NestJS responded with code ${response.status} for ${endpoint}`);
        return null;
    } catch (e) {
        console.warn(`[ZaLo Compat Engine] NestJS endpoint ${endpoint} unreachable:`, e.message);
        return null;
    }
}

// 2. Auth State and Actions
let lastStateValue = undefined;

export function onAuthStateChanged(auth, callback) {
    let isSetted = false;
    let timeoutId = null;

    const triggerCallback = (user) => {
        const stateId = user ? user.id : null;
        if (stateId === lastStateValue) {
            console.log("onAuthStateChanged: Suppressing duplicate state trigger:", stateId);
            return;
        }
        lastStateValue = stateId;
        callback(user);
    };

    const hasHashToken = window.location.hash.includes("access_token=") || window.location.search.includes("access_token=");
    const maxWaitMs = hasHashToken ? 2000 : 3500;

    console.log(`onAuthStateChanged: Initiating patient session check (Wait up to ${maxWaitMs}ms)...`);

    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                if (timeoutId) clearTimeout(timeoutId);
                isSetted = true;
                const user = {
                    uid: session.user.id,
                    id: session.user.id,
                    email: session.user.email,
                    ...session.user
                };
                triggerCallback(user);
                return true;
            }
        } catch (e) {
            console.warn("Patient session check error:", e);
        }
        return false;
    };

    checkSession().then(found => {
        if (!found) {
            const startTime = Date.now();
            const interval = setInterval(async () => {
                const foundNow = await checkSession();
                if (foundNow || (Date.now() - startTime >= maxWaitMs)) {
                    clearInterval(interval);
                    if (!foundNow && !isSetted) {
                        isSetted = true;
                        triggerCallback(null);
                    }
                }
            }, 50);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("onAuthStateChanged: Supabase Auth event received:", event);
        if (session) {
            isSetted = true;
            if (timeoutId) clearTimeout(timeoutId);
            const user = {
                uid: session.user.id,
                id: session.user.id,
                email: session.user.email,
                ...session.user
            };
            triggerCallback(user);
        } else {
            if (isSetted) {
                triggerCallback(null);
            }
        }
    });

    timeoutId = setTimeout(() => {
        if (!isSetted) {
            console.log("onAuthStateChanged: Settle timeout reached, fallback to null.");
            isSetted = true;
            triggerCallback(null);
        }
    }, maxWaitMs);

    return () => {
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
    };
}

export async function signOut() {
    localStorage.removeItem('nestjs_token');
    localStorage.removeItem('nestjs_user');
    return await supabase.auth.signOut();
}

export async function signInWithEmailAndPassword(auth, email, password) {
    // 1. First attempt login with NestJS backend (PostgreSQL database integration)
    console.log("[ZaLo Compat Engine] Registering login session with NestJS backend...");
    const nestResult = await callNestApi('auth/login', 'POST', { email, password });
    if (nestResult && nestResult.access_token) {
        localStorage.setItem('nestjs_token', nestResult.access_token);
        localStorage.setItem('nestjs_user', JSON.stringify(nestResult.user));
        console.log("[ZaLo Compat Engine] NestJS Auth successful.");
    }

    // 2. Perform regular Supabase auth flow
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return {
        user: {
            uid: data.user.id,
            id: data.user.id,
            email: data.user.email,
            ...data.user
        }
    };
}

export async function createUserWithEmailAndPassword(auth, email, password) {
    // 1. Register with NestJS backend as well for unified database mapping
    console.log("[ZaLo Compat Engine] Registering account on NestJS backend...");
    await callNestApi('auth/register', 'POST', {
        name: email.split('@')[0],
        email,
        password,
        role: 'CUSTOMER',
        wilaya: 'الجزائر',
        commune: 'المرسى'
    });

    // 2. Create in Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return {
        user: {
            uid: data.user.id,
            id: data.user.id,
            email: data.user.email,
            ...data.user
        }
    };
}

// 3. Firestore Query Builder Mimicry
export class FirestoreDocRef {
    constructor(table, id) {
        this.table = table;
        this.id = id;
    }
}

export class FirestoreColRef {
    constructor(table) {
        this.table = table;
    }
}

export class FirestoreQuery {
    constructor(colRef, filters = [], orderByFields = [], limitCount = null) {
        this.table = colRef.table;
        this.filters = filters;
        this.orderByFields = orderByFields;
        this.limitCount = limitCount;
    }
}

export const doc = (db, table, id) => new FirestoreDocRef(table, id);
export const collection = (db, table) => new FirestoreColRef(table);

export const query = (colRef, ...conditions) => {
    const filters = conditions.filter(c => c && c.type === 'where');
    const orderBys = conditions.filter(c => c && c.type === 'orderBy');
    const limits = conditions.filter(c => c && c.type === 'limit');
    
    return new FirestoreQuery(
        colRef,
        filters,
        orderBys,
        limits.length > 0 ? limits[0].value : null
    );
};

export const where = (field, op, val) => {
    let mappedField = field;
    if (field === 'uid') mappedField = 'id';
    return { type: 'where', field: mappedField, op, val };
};

export const limit = (n) => ({ type: 'limit', value: n });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });

// 4. Data Operations (getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc)
export async function getDoc(docRef) {
    // If querying specific profile, first try getting profile from NestJS
    if (docRef.table === 'profiles') {
        const token = localStorage.getItem('nestjs_token');
        if (token) {
            const nestProfile = await callNestApi('users/profile', 'GET', null, token);
            if (nestProfile && nestProfile.data) {
                return {
                    exists: true,
                    exists() { return true; },
                    id: docRef.id,
                    data: () => nestProfile.data
                };
            }
        }
    }

    const { data, error } = await supabase
        .from(docRef.table)
        .select('*')
        .eq('id', docRef.id)
        .maybeSingle();

    if (error) {
        console.error(`getDoc error for ${docRef.table} [${docRef.id}]:`, error.message);
    }

    return {
        exists: !!data,
        exists() { return !!data; },
        id: docRef.id,
        data: () => data
    };
}

export async function getDocs(queryObj) {
    const table = queryObj.table || queryObj;

    // 1. Try unified NestJS API routing for products catalog
    if (table === 'products') {
        console.log("[ZaLo Compat Engine] Fetching products via NestJS REST API...");
        const nestProducts = await callNestApi('products');
        if (nestProducts && nestProducts.data) {
            const docs = nestProducts.data.map(prod => ({
                id: prod.id,
                exists: true,
                exists() { return true; },
                data: () => ({
                    id: prod.id,
                    title: prod.name,
                    price: prod.price,
                    category: prod.category,
                    desc: prod.description,
                    stock: prod.stock,
                    url: prod.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
                    isApproved: true,
                    storeID: "101",
                    storeName: "متجر النور للإلكترونيات"
                })
            }));
            return {
                empty: docs.length === 0,
                docs: docs,
                forEach(cb) { docs.forEach(cb); }
            };
        }
    }

    // 2. Try NestJS routing for orders list
    if (table === 'orders') {
        console.log("[ZaLo Compat Engine] Fetching orders via NestJS REST API...");
        const token = localStorage.getItem('nestjs_token');
        if (token) {
            const nestOrders = await callNestApi('orders', 'GET', null, token);
            if (nestOrders) {
                const list = Array.isArray(nestOrders) ? nestOrders : (nestOrders.data || []);
                const docs = list.map(ord => ({
                    id: ord.id,
                    exists: true,
                    exists() { return true; },
                    data: () => ({
                        id: ord.id,
                        customerName: ord.customerName || "زبون متجر زالو",
                        total: ord.totalAmount,
                        paymentMethod: ord.paymentMethod,
                        paymentStatus: ord.paymentStatus,
                        status: ord.status === 'SHIPPING' ? 'في الطريق' : ord.status === 'DELIVERED' ? 'تم التسليم' : 'قيد المراجعة',
                        address: ord.address,
                        wilaya: ord.wilaya,
                        commune: ord.commune,
                        trackingNumber: ord.trackingNumber || "DZ-ZALO-MOCK",
                        timestamp: ord.timestamp || Date.now()
                    })
                }));
                return {
                    empty: docs.length === 0,
                    docs: docs,
                    forEach(cb) { docs.forEach(cb); }
                };
            }
        }
    }

    // Standard Supabase Fallback
    let q = supabase.from(table).select('*');
    
    if (queryObj.filters && queryObj.filters.length > 0) {
        for (const filter of queryObj.filters) {
            const { field, op, val } = filter;
            if (op === '==') {
                q = q.eq(field, val);
            } else if (op === '>=') {
                q = q.gte(field, val);
            } else if (op === '<=') {
                q = q.lte(field, val);
            } else if (op === 'in') {
                q = q.in(field, val);
            } else if (op === '!=') {
                q = q.neq(field, val);
            }
        }
    }

    if (queryObj.orderByFields && queryObj.orderByFields.length > 0) {
        for (const o of queryObj.orderByFields) {
            q = q.order(o.field, { ascending: o.direction !== 'desc' });
        }
    }

    if (queryObj.limitCount) {
        q = q.limit(queryObj.limitCount);
    }

    const { data, error } = await q;
    if (error) {
        console.error(`getDocs error for ${table}:`, error.message);
    }

    const docs = (data || []).map(row => ({
        id: row.id || row.uid || '',
        exists: true,
        exists() { return true; },
        data: () => row
    }));

    return {
        empty: docs.length === 0,
        docs: docs,
        forEach(cb) { docs.forEach(cb); }
    };
}

export async function addDoc(colRef, data) {
    // Intercept checkout to create order in NestJS + PostgreSQL
    if (colRef.table === 'orders') {
        const token = localStorage.getItem('nestjs_token');
        if (token) {
            console.log("[ZaLo Compat Engine] Routing Order creation to NestJS API...");
            const orderPayload = {
                items: [
                    {
                        productId: parseInt(data.productID) || 1001,
                        productName: data.productName || "سلعة زالو الرائعة",
                        price: parseFloat(data.price) || data.total,
                        quantity: parseInt(data.qty) || 1
                    }
                ],
                address: data.address || "غير محدد",
                wilaya: data.wilaya || "الجزائر",
                commune: data.commune || "المرسى",
                paymentMethod: data.paymentMethod === 'BaridiMob' ? 'BARIDIMOB' : data.paymentMethod === 'CCP' ? 'CCP' : 'COD'
            };
            const result = await callNestApi('orders', 'POST', orderPayload, token);
            if (result) {
                console.log("[ZaLo Compat Engine] Order created on NestJS successfully:", result.id);
            }
        }
    }

    const cleanData = { ...data };
    const { data: inserted, error } = await supabase
        .from(colRef.table)
        .insert(cleanData)
        .select()
        .single();

    if (error) {
        console.error(`addDoc error for ${colRef.table}:`, error.message);
        throw error;
    }

    return {
        id: inserted ? (inserted.id || inserted.uid) : null,
        data: () => inserted
    };
}

export async function setDoc(docRef, data, options) {
    const payload = { id: docRef.id, ...data };
    const { error } = await supabase
        .from(docRef.table)
        .upsert(payload);

    if (error) {
        console.error(`setDoc error for ${docRef.table}:`, error.message);
        throw error;
    }
}

export async function updateDoc(docRef, data) {
    const { error } = await supabase
        .from(docRef.table)
        .update(data)
        .eq('id', docRef.id);

    if (error) {
        console.error(`updateDoc error for ${docRef.table}:`, error.message);
        throw error;
    }
}

export async function deleteDoc(docRef) {
    const { error } = await supabase
        .from(docRef.table)
        .delete()
        .eq('id', docRef.id);

    if (error) {
        console.error(`deleteDoc error for ${docRef.table}:`, error.message);
        throw error;
    }
}

// 5. Reactive Listener (onSnapshot)
export function onSnapshot(queryOrDoc, callback, errCallback) {
    let active = true;
    
    const trigger = async () => {
        if (!active) return;
        try {
            if (queryOrDoc instanceof FirestoreDocRef) {
                const docSnap = await getDoc(queryOrDoc);
                if (active) callback(docSnap);
            } else {
                const docsSnap = await getDocs(queryOrDoc);
                const snap = {
                    empty: docsSnap.empty,
                    docs: docsSnap.docs,
                    docChanges: () => docsSnap.docs.map(d => ({ type: 'added', doc: d })),
                    forEach(cb) { docsSnap.docs.forEach(cb); }
                };
                if (active) callback(snap);
            }
        } catch (err) {
            if (active && errCallback) errCallback(err);
        }
    };

    trigger();

    // Clean and performant interval polling every 4 seconds for immediate updates
    const intervalId = setInterval(trigger, 4000);

    return () => {
        active = false;
        clearInterval(intervalId);
    };
}
