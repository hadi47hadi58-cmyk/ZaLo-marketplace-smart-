// ZaLo Market - Firebase Config (firebase-config.js)
// This file coordinates with Firebase SDK for hosting, authentication, storage, and firestore configurations

// Paste your Firebase Config keys from the Firebase Developer Console here:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "zalomarket-smart.firebaseapp.com",
    projectId: "zalomarket-smart",
    storageBucket: "zalomarket-smart.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Real-world integration initialization code (ready to be uncommented on production deploy):
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("Firebase initialized successfully for ZaLo Market.");
*/
