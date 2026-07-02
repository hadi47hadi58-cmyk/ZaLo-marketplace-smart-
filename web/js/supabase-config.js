// ZaLo Smart Marketplace - Supabase Config (supabase-config.js)
// This file initializes the Supabase Client for the client-side Web Application.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Credentials (loaded dynamically from window context, process.env, or falling back to build placeholders)
const SUPABASE_URL = window.SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_KEY) || "SUPABASE_KEY_PLACEHOLDER";

// Expose public config variables on window for use by other scripts (like sub-client registration)
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Helper for Secure Authenticated Session
export async function getSessionUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Failed to fetch session:", error.message);
        return null;
    }
    return session ? session.user : null;
}

// Expose globally for backward compatibility
window.supabase = supabase;
window.supabaseGetSessionUser = getSessionUser;

console.log("Supabase Client initialized successfully for ZaLo Smart.");
