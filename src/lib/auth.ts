
'use client';

import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}

// This function now just creates the user in Firebase Auth.
// The Cloud Function 'addDefaultRoleClaim' is responsible for creating the Firestore document.
export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // We no longer write to Firestore from the client.
        // The Cloud Function will detect the new user and create the document.
        // We just need to wait a bit for the function to trigger and create the doc.
         await new Promise(resolve => setTimeout(resolve, 2000));

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

// **IMPROVED AND MORE SECURE LOGIN LOGIC**
export async function signInUser(email: string, password: string, loginType: 'admin' | 'merchant') {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(db, "users", user.uid);
        let userDoc = await getDoc(userDocRef);

        // FIX: If the user exists in Auth but not Firestore, create their document now.
        if (!userDoc.exists()) {
            console.warn(`User ${user.uid} exists in Auth but not Firestore. Creating document now.`);
            // This is a simplified version of the logic in the Cloud Function.
            // It ensures that any user who logs in has a Firestore document.
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || 'New User',
                avatar: user.photoURL || `https://placehold.co/96x96.png?text=${(user.displayName || 'U').charAt(0)}`,
                role: 'merchant', // Default role for users created this way
                status: 'Active',
                plan: 'Free',
                kycStatus: "Not Started",
                createdAt: serverTimestamp(),
                handle: (user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`).toLowerCase().replace(/[^a-z0-9]/g, ''),
                handleLastUpdatedAt: null,
                handleEditCount: 0,
                walletBalance: 0,
            });
            // Re-fetch the document after creating it
            userDoc = await getDoc(userDocRef);
        }
        
        const userRole = userDoc.data()?.role;

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
