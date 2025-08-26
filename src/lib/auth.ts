
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
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}

export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // IMPORTANT: We no longer write to Firestore from the client.
        // The `addDefaultRoleClaim` Cloud Function will be the single source of truth
        // for creating the user document. This is more secure and reliable.
        
        // We can still update the Auth display name here.
        await updateProfile(user, { displayName: additionalData.fullName });

        // We add a small delay to allow the Cloud Function to trigger and set the custom claim.
        // This helps ensure the user has the correct role when they are redirected.
        await new Promise(resolve => setTimeout(resolve, 2500));

        return { success: true, userId: user.uid };
    } catch (error: any) {
        console.error("Error creating user:", error);
        let errorMessage = "An unknown error occurred during signup.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use by another account.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'The password is too weak. Please use at least 6 characters.';
        }
        return { success: false, error: errorMessage };
    }
}

export async function signInUser(email: string, password: string, loginType: 'admin' | 'merchant') {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Let's ensure the claims are up-to-date before checking them.
        const idTokenResult = await user.getIdTokenResult(true);
        const userRole = idTokenResult.claims.role;

        // Security Check: Enforce that only admins can log in via the admin page.
        if (loginType === 'admin' && userRole !== 'admin') {
            await signOut(auth);
            return { success: false, error: "Access denied. Only administrators can log in here." };
        }

        // Security Check: Enforce that only merchants can log in via the merchant page.
        if (loginType === 'merchant' && userRole !== 'merchant') {
            await signOut(auth);
            return { success: false, error: "Access denied. Please use the Admin Login page." };
        }
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        return { success: true, user: { uid: user.uid, ...userDoc.data() } };
        
    } catch (error: any) {
        console.error("Error signing in:", error);
        let errorMessage = "An unexpected error occurred during login.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password. Please try again.';
        }
        return { success: false, error: errorMessage };
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

export async function sendPasswordReset(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "No user found with this email address.";
        }
        return { success: false, error: errorMessage };
    }
}
