
'use server';

import * as admin from 'firebase-admin';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  try {
    // This relies on the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // being set in the hosting environment.
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase Admin initialization error in users/actions.ts', e);
  }
}

interface User {
    id: string;
    fullName: string;
    email: string;
    plan?: string;
    status?: string;
    avatar?: string;
    role?: string;
}

export async function fetchUsers(): Promise<User[]> {
    try {
        // IMPORTANT: By calling getFirestore() from the admin SDK, we bypass
        // all client-side security rules. This is a privileged operation
        // that will succeed regardless of the logged-in user's role.
        const adminDb = admin.firestore();
        const usersCollection = adminDb.collection("users");
        const userSnapshot = await getDocs(usersCollection);
        
        if (userSnapshot.empty) {
            console.log("No users found via admin action.");
            return [];
        }
        
        const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
        
        return userList;

    } catch (error) {
        console.error("Error fetching users in Server Action with Admin SDK: ", error);
        // We throw the error so the client-side component can catch it.
        throw new Error("Failed to fetch users using admin privileges. Check server logs.");
    }
}
