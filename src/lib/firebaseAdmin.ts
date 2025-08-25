
import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { App } from 'firebase-admin/app';

let app: App;
let db: Firestore;

try {
    if (admin.apps.length > 0) {
        app = admin.app();
        db = getFirestore(app);
    } else {
         const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY!);

        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        db = getFirestore(app);
    }
} catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    // We don't throw an error here to prevent crashing the server on failed import,
    // but subsequent calls will fail if 'db' is not initialized.
}

export const getFirebaseAdmin = () => {
    if (!db) {
        throw new Error('Firebase Admin SDK is not initialized. Check server logs for the original error.');
    }
    return { admin, db };
};
