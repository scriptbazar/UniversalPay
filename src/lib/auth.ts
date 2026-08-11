'use client';

import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type User
} from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}

const parseAuthError = (error: any, defaultMsg: string): string => {
    const code = error?.code || '';
    if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
        return "Firebase Auth API Key is invalid or not enabled in Firebase Console. Please update NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.";
    }
    if (code === 'auth/email-already-in-use') {
        return 'This email address is already in use by another account.';
    }
    if (code === 'auth/weak-password') {
        return 'The password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        return 'Invalid email or password. Please check your credentials.';
    }
    return error?.message || defaultMsg;
};

export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (additionalData.fullName) {
            await updateProfile(user, { displayName: additionalData.fullName });
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, userId: user.uid };
    } catch (error: any) {
        console.warn("Auth signup notice:", error?.message || error);
        return { success: false, error: parseAuthError(error, "An error occurred during signup.") };
    }
}

export async function signInUser(email: string, password: string, loginType: 'admin' | 'merchant') {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const idTokenResult = await user.getIdTokenResult(true);
        const userRole = idTokenResult.claims.role;

        if (loginType === 'admin' && userRole !== 'admin') {
            await signOut(auth);
            return { success: false, error: "Access denied. Only administrators can log in here." };
        }

        if (loginType === 'merchant' && userRole !== 'merchant') {
            await signOut(auth);
            return { success: false, error: "Access denied. Please use the Merchant Login page." };
        }
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        return { success: true, user: { uid: user.uid, ...userDoc.data() } };
        
    } catch (error: any) {
        console.warn("Auth signin notice:", error?.message || error);
        return { success: false, error: parseAuthError(error, "An error occurred during login.") };
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.warn("Auth signout notice:", error?.message || error);
        return { success: false, error: error.message || "Failed to sign out." };
    }
}

export async function sendPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.warn("Password reset notice:", error?.message || error);
        return { success: false, error: parseAuthError(error, "Could not send password reset email.") };
    }
}
