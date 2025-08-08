
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
    sendPasswordResetEmail,
    type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

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
        
        // Always fetch the user role from Firestore for reliability.
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await signOut(auth);
            return { success: false, error: "User data not found in database. Please contact support." };
        }
        
        const userRole = userDoc.data()?.role;

        // Security Check: Enforce that only admins can log in via the admin page.
        if (loginType === 'admin' && userRole !== 'admin') {
            await signOut(auth);
            return { success: false, error: "Access denied. Only administrators can log in here." };
        }

        // Security Check: Enforce that only merchants can log in via the merchant page.
        if (loginType === 'merchant' && (userRole !== 'merchant' && userRole !== 'reseller')) {
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

        // The on-create Cloud Function handles document creation. We just wait for it here.
        // In a more robust implementation, you might poll for the document or use a callable function.
        if (!userDoc.exists()) {
            // A small delay to allow the Cloud Function to create the document
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const finalUserDoc = await getDoc(userDocRef);
        
        if (!finalUserDoc.exists()) {
             throw new Error("User document was not created in time. Please try again.");
        }

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
