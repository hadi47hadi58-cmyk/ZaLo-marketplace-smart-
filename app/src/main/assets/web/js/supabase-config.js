// ZaLo Smart Marketplace - Supabase Config (supabase-config.js)
// This file initializes the Supabase Client for the client-side Web Application.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Credentials (will fallback to public credentials or placeholders)
const SUPABASE_URL = "https://xwwzadxsqmmxerbolovz.supabase.co"; // Replace with your actual project URL
const SUPABASE_ANON_KEY = "Sb_publishable_qJ60bIG-VZXemJ5L0GhY3w_1I7718wl"; // Replace with your actual anon key

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
