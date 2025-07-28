
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

// This function now just writes to Firestore.
// The Cloud Function will handle setting the custom claim.
export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // The Cloud Function is responsible for setting the custom claim.
        // The client-side code is responsible for creating the user document in Firestore.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            role: 'merchant', // All new users start as merchants
            status: 'Active',
            plan: 'Free',
            createdAt: serverTimestamp(),
        });

        return { success: true, userId: user.uid };
    } catch (error: any) {
        console.error("Error creating user:", error);
        return { success: false, error: error.message };
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
            });
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
