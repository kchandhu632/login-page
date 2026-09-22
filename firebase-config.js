/**
 * Aura — Firebase Configuration & Initialization
 * Realtime Database & Authentication setup for project: aura-b6cf4
 */

const firebaseConfig = {
  apiKey: "AIzaSyBoGFqm1t2INJSzOBSaDmdpweB7xt3VOp4",
  authDomain: "aura-b6cf4.firebaseapp.com",
  databaseURL: "https://aura-b6cf4-default-rtdb.firebaseio.com",
  projectId: "aura-b6cf4",
  storageBucket: "aura-b6cf4.firebasestorage.app",
  messagingSenderId: "469984660733",
  appId: "1:469984660733:web:0f426b6c4a84808c8a0294",
  measurementId: "G-6YTQFRYSFR"
};

// Initialize Firebase App
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global Auth and Database references
const auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
const database = typeof firebase !== 'undefined' ? firebase.database() : null;
