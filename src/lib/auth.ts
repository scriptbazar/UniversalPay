
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

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}

// This function is now more reliable for creating the user document.
export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // The Cloud Function will now ONLY write to Firestore. No more custom claims from there.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            role: 'merchant', // Default role in Firestore
            status: 'Active',
            plan: 'Free',
            createdAt: serverTimestamp(),
        }, { merge: true });

        return { success: true, userId: user.uid };
    } catch (error: any) => {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
    }
}

// **NEW AND IMPROVED LOGIN LOGIC**
export async function signInUser(email: string, password: string, loginType: 'admin' | 'merchant') {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // **THE FIX: Directly fetch the user role from Firestore, ignoring the token.**
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // This should not happen for email/password users, but it's a good fallback.
            await signOut(auth);
            return { success: false, error: "User data not found. Please contact support." };
        }

        const userData = userDoc.data();
        const firestoreRole = userData.role || 'merchant';
        
        console.log(`User ${user.uid} signed in. Role from Firestore: ${firestoreRole}`);

        // Security Check: Enforce login page types based on the reliable Firestore role
        if (loginType === 'admin' && firestoreRole !== 'admin') {
            await signOut(auth);
            return { success: false, error: "Access denied. Only administrators can log in here." };
        }

        if (loginType === 'merchant' && firestoreRole === 'admin') {
            await signOut(auth);
            return { success: false, error: "Admin accounts should use the Admin Login page." };
        }

        return { success: true, user: { uid: user.uid, ...userData } };
        
    } catch (error: any) {
        console.error("Error signing in:", error);
        let errorMessage = "An unexpected error occurred during login.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password. Please try again.';
        }
        return { success: false, error: errorMessage };
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

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || 'Social User',
                avatar: user.photoURL,
                role: 'merchant',
                status: 'Active',
                plan: 'Free',
                createdAt: serverTimestamp(),
            }, { merge: true });
        }
        
        const finalUserDoc = await getDoc(userDocRef);
        const userData = finalUserDoc.data();

        // Security check for social logins
        if (userData?.role === 'admin') {
            await signOut(auth);
            return { success: false, error: 'Admin accounts cannot use social login.' };
        }

        return { success: true, user: { uid: user.uid, ...userData } };

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
