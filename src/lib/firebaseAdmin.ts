
import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { App } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
import * as path from 'path';

// This ensures that .env variables are loaded when this module is imported.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

let app: App | undefined;
let db: Firestore | undefined;

function initialize() {
    if (admin.apps.length > 0) {
        app = admin.app();
        db = getFirestore(app);
        return { admin, db };
    }

    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
        }
        
        app = admin.initializeApp({
            // Using applicationDefault will automatically use the credentials
            // from the GOOGLE_APPLICATION_CREDENTIALS environment variable
            // when running locally, and the service account associated with the
            // App Hosting backend when deployed. This is the most robust method.
            credential: admin.credential.applicationDefault(),
            projectId: projectId,
        });

        db = getFirestore(app);
        console.log('Firebase Admin SDK initialized successfully.');

    } catch (error: any) {
        console.error('Firebase admin initialization error:', error.message);
        // Provide a more helpful error message for the user.
        let helpfulError = 'Could not initialize Firebase Admin SDK. Please check your credentials.';
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            helpfulError += ' The GOOGLE_APPLICATION_CREDENTIALS environment variable is missing.';
        } else if (error.message.includes('ENOENT')) { // File not found error
             helpfulError += ` The service account file specified in GOOGLE_APPLICATION_CREDENTIALS was not found at path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`;
        }
        throw new Error(helpfulError);
    }
    
    return { admin, db };
}

export function getFirebaseAdmin() {
    // This pattern ensures that initialization happens only once.
    if (!app || !db) {
        return initialize();
    }
    return { admin, db };
}
