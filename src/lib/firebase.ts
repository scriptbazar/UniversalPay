
'use server';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com` : undefined,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // --- YEH BADLAV KIYA GAYA HAI ---
  // Aam taur par database ID '(default)' hota hai.
  // Ise yahan batane se app hamesha sahi database se connect hoga.
  databaseId: '(default)',
  // -----------------------------
};

let app: FirebaseApp;
if (getApps().length === 0) {
    if (firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
    } else {
        // Yeh error dega agar configuration maujood nahi hai
        throw new Error("Firebase configuration is missing or incomplete. Please check your environment variables.");
    }
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
