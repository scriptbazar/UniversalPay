import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyABNmB1Op_cwat9iNDyztloLohEHjMLbiE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "universalpay-ir4yd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "universalpay-ir4yd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "universalpay-ir4yd.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "573852939232",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:573852939232:web:5181ba8a00ef787a583185",
};

// Initialize Firebase for SSR and CSR, ensuring it's only done once.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use inMemoryPersistence to prevent iframe.js getProjectConfig background 400 network calls
let auth: Auth;
if (typeof window !== 'undefined') {
  try {
    auth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, auth, db };
