
import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { App } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let app: App | undefined;
let db: Firestore | undefined;

function initialize() {
  if (admin.apps.length === 0) {
    try {
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      if (!serviceAccountPath) {
        throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
      }
      if (!projectId) {
        throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
      }

      const absoluteServiceAccountPath = path.resolve(process.cwd(), serviceAccountPath);
      
      if (!fs.existsSync(absoluteServiceAccountPath)) {
        throw new Error(`Service account file not found at: ${absoluteServiceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(absoluteServiceAccountPath, 'utf8'));
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
      });

      db = getFirestore(app);
      console.log('Firebase Admin SDK initialized successfully.');

    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.message);
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

// Export a function that returns the initialized instances.
// This ensures that initialization is attempted only when needed.
export function getFirebaseAdmin() {
    if (!app || !db) {
        return initialize();
    }
    return { admin, db };
}
