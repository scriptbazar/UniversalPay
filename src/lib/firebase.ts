
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Construct the authDomain from the project ID to ensure it's always correct
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com` : undefined,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Lazily initialize Firebase
function getFirebaseInstances() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
                app = initializeApp(firebaseConfig);
            } else {
                console.error("Firebase configuration is missing or incomplete. Please check your environment variables.");
                // You can either throw an error or handle it gracefully.
                // For this example, we'll let it fail silently and the app can show an error state.
                return { app: {} as FirebaseApp, auth: {} as Auth, db: {} as Firestore };
            }
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
       // Provide dummy instances for server-side rendering
        app = {} as FirebaseApp;
        auth = {} as Auth;
        db = {} as Firestore;
    }
    return { app, auth, db };
}

// Initial call to set up the exports
const instances = getFirebaseInstances();
app = instances.app;
auth = instances.auth;
db = instances.db;


export { app, auth, db };

