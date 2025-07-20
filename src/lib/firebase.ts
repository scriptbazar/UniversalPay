
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

// Initialize Firebase for SSR and CSR
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Check if all required Firebase config keys are present and not placeholders
const isConfigValid = 
    firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE' &&
    firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID_HERE';

if (!getApps().length) {
  if (isConfigValid) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      console.error("Firebase initialization error", e);
      // Assign dummy objects to prevent app crash if initialization fails
      app = {} as FirebaseApp;
      auth = {} as Auth;
      db = {} as Firestore;
    }
  } else {
    console.error(
      "Firebase config is missing or invalid. Make sure to set NEXT_PUBLIC_FIREBASE environment variables in your .env file."
    );
    // Assign dummy objects if config is missing or invalid
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
