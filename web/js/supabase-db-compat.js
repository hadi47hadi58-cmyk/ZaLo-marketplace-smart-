// ZaLo Smart Marketplace - Supabase Firestore/Auth Compatibility Layer
// This file acts as a drop-in replacement for the Firebase modular SDK,
// routing all operations completely and exclusively through Supabase.

import { supabase } from './supabase-config.js';

export { supabase };

// 1. Core / Initializers
export function initializeApp() {
    return { name: "ZaLo-Supabase-Compat" };
}

export function getAuth() {
    return { name: "ZaLo-Supabase-Auth-Compat" };
}

export function getFirestore() {
    return { name: "ZaLo-Supabase-Db-Compat" };
}

export const serverTimestamp = () => new Date().toISOString();

// Dummy Auth Provider for import compatibility
export class GoogleAuthProvider {
    static credential(token) { return { token }; }
}

// 2. Auth State and Actions
export function onAuthStateChanged(auth, callback) {
    // Trigger callback initially with current user if exists
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            const user = {
                uid: session.user.id,
                id: session.user.id,
                email: session.user.email,
                ...session.user
            };
            callback(user);
        } else {
            callback(null);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            const user = {
                uid: session.user.id,
                id: session.user.id,
                email: session.user.email,
                ...session.user
            };
            callback(user);
        } else {
            callback(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function signInWithEmailAndPassword(auth, email, password) {
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
    // Map standard firestore uids/ids to unified "id" column if relevant
    let mappedField = field;
    if (field === 'uid') mappedField = 'id';
    return { type: 'where', field: mappedField, op, val };
};

export const limit = (n) => ({ type: 'limit', value: n });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });

// 4. Data Operations (getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc)
export async function getDoc(docRef) {
    // First try querying where 'id' is docRef.id, otherwise fallback
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
    // If the data does not have the 'id' field, inject docRef.id
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

    // Immediate initial fetch
    trigger();

    // Clean and performant interval polling every 4 seconds for immediate updates
    const intervalId = setInterval(trigger, 4000);

    return () => {
        active = false;
        clearInterval(intervalId);
    };
}
