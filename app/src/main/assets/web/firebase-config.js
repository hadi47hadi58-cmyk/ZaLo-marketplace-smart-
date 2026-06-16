// ZaLo Market - Firebase Config (firebase-config.js)
// This file coordinates with Firebase SDK for hosting, authentication, storage, and firestore configurations

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDTTM8qt9MBpy9MzLnyd17_shNulkQb9Hw",
    authDomain: "zalo-marketplace-smart-final.firebaseapp.com",
    projectId: "zalo-marketplace-smart-final",
    storageBucket: "zalo-marketplace-smart-final.firebasestorage.app",
    messagingSenderId: "393402903971",
    appId: "1:393402903971:web:7c521e8cb7b823d306be16"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully for ZaLo Market.");
