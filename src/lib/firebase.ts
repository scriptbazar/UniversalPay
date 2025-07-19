
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase lazily
function initializeFirebase() {
    if (!getApps().length) {
        if (firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
        } else {
            console.error("Firebase API Key is missing. Please check your .env file.");
            // We can't initialize, so we'll have to stop here.
            // A mock or dummy implementation could be returned for non-crashing UI,
            // but for auth/db, failing is often better.
            throw new Error("Firebase configuration is incomplete.");
        }
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

// Ensure Firebase is initialized before exporting
if (!getApps().length) {
    if(firebaseConfig.apiKey) {
        initializeFirebase();
    } else {
        // If no API key, we can't initialize. 
        // We'll set up dummy exports that will throw an error if used.
        const uninitializedError = () => { throw new Error("Firebase is not initialized. Please provide API keys in .env") };
        app = {} as FirebaseApp;
        auth = { currentUser: null } as unknown as Auth;
        db = {} as Firestore;
    }
} else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
}


export { app, auth, db };
