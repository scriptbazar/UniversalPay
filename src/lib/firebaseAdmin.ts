
import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { App } from 'firebase-admin/app';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded for server-side code.
dotenv.config();

let app: App | undefined;
let db: Firestore | undefined;

function initialize() {
  if (admin.apps.length === 0) {
    try {
      // When running on Firebase/Google Cloud, the SDK automatically finds the credentials.
      // For local development, you need to set the GOOGLE_APPLICATION_CREDENTIALS
      // environment variable to point to your service account key file.
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      db = getFirestore(app);
      console.log('Firebase Admin SDK initialized.');
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      // We throw an error here to make it clear that the initialization failed.
      // This prevents subsequent calls from failing silently.
      throw new Error('Could not initialize Firebase Admin SDK. Please check your credentials.');
    }
  } else {
    app = admin.apps[0]!;
    db = getFirestore(app);
  }
  return { admin, db };
}

export function getFirebaseAdmin() {
    if (!app || !db) {
        return initialize();
    }
    return { admin, db };
}
