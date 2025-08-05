
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the app is only initialized once
if (!admin.apps.length) {
  try {
    // When running on Firebase/Google Cloud, the SDK automatically finds the credentials.
    // For local development, you need to set the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable to point to your service account key file.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = getFirestore();

export { admin, db };
