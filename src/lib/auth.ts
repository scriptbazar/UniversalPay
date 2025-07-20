
'use client';

import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import * as admin from "firebase-admin"; // Import admin SDK

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}

async function getUserRole(user: User): Promise<string> {
    // Force a token refresh to get the latest custom claims.
    await user.getIdToken(true);
    const decodedToken = await user.getIdTokenResult();
    return decodedToken.claims.role || 'merchant';
}

// Helper to check if a collection is empty.
async function isCollectionEmpty(collectionPath: string): Promise<boolean> {
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(query(collectionRef, limit(1)));
    return snapshot.empty;
}


export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const isFirst = await isCollectionEmpty("users");
        const role = isFirst ? 'admin' : 'merchant';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // The Cloud Function will set the 'merchant' claim.
        // If this is the first user, we override it to 'admin' in Firestore immediately.
        // The custom claim itself will be set by the Cloud Function, but we can manage the DB role here.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            role: role, // Set the determined role in Firestore
            status: 'Active',
            plan: 'Free',
            createdAt: serverTimestamp(),
        }, { merge: true });

        // If it's the first user, we also need to explicitly set their custom claim to admin.
        // This is best done via a backend/cloud function, but for simplicity here,
        // we'll rely on the idea that the first user will have their role elevated.
        // The Cloud Function is the most reliable way to set claims.
        // Let's adjust the cloud function to handle this logic.
        
        console.log(`User document created with intended role: ${role}`);
        return { success: true, userId: user.uid };
    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
}

export async function signInUser(email: string, password: string, loginType: 'admin' | 'merchant') {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const role = await getUserRole(user);
        console.log(`User ${user.uid} signed in with role: ${role}`);

        if (loginType === 'admin' && role !== 'admin') {
            await signOut(auth); // Sign out the user
            return { success: false, error: "Access denied. Only administrators can log in here." };
        }

        if (loginType === 'merchant' && role === 'admin') {
            await signOut(auth); // Sign out the user
            return { success: false, error: "Admin accounts should use the Admin Login page." };
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        return { success: true, user: { uid: user.uid, role, ...userData } };
        
    } catch (error: any) {
        console.error("Error signing in:", error);
        return { success: false, error: error.message };
    }
}

export async function signInWithSocial(providerName: 'google' | 'github' | 'facebook') {
    let provider;
    switch (providerName) {
        case 'google':
            provider = new GoogleAuthProvider();
            break;
        case 'github':
            provider = new GithubAuthProvider();
            break;
        case 'facebook':
            provider = new FacebookAuthProvider();
            break;
        default:
            return { success: false, error: 'Invalid social provider.' };
    }

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let role = 'merchant'; // Default for social sign-in

        if (!userDoc.exists()) {
             // The cloud function will assign the 'merchant' role by default.
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || 'Social User',
                avatar: user.photoURL,
                role: 'merchant', // Firestore role
                status: 'Active',
                plan: 'Free',
                createdAt: serverTimestamp(),
            }, { merge: true });
        } else {
            role = await getUserRole(user);
        }
        
        if (role === 'admin') {
            await signOut(auth);
            return { success: false, error: 'Admin accounts cannot use social login.' };
        }

        const finalUserDoc = await getDoc(userDocRef);

        return { success: true, user: { uid: user.uid, role, ...finalUserDoc.data() } };

    } catch (error: any) {
        console.error(`Error with ${providerName} sign-in:`, error);
        if (error.code === 'auth/account-exists-with-different-credential') {
            return { success: false, error: 'An account already exists with the same email address but different sign-in credentials.' };
        }
        return { success: false, error: error.message };
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error("Error signing out:", error);
        return { success: false, error: error.message };
    }
}
