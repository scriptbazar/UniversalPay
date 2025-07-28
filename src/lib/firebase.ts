
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required Firebase config keys are present and not placeholders
const isConfigValid = 
    firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
    firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID_HERE';

// Initialize Firebase for SSR and CSR, ensuring it's only done once.
const app: FirebaseApp = !getApps().length && isConfigValid ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);


if (!isConfigValid) {
    console.error(
      "Firebase config is missing or invalid. Make sure to set NEXT_PUBLIC_FIREBASE environment variables in your .env file."
    );
}

export { app, auth, db };
