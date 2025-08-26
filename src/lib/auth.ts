
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
        
        // --- Create user document directly in Firestore from the client ---
        const userDocRef = doc(db, 'users', user.uid);
        const handle = `${additionalData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${user.uid.substring(0, 6)}`;
        
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            avatar: `https://placehold.co/96x96.png?text=${additionalData.fullName.charAt(0)}`,
            role: 'merchant', // Default role
            status: 'Active',
            plan: 'Free',
            kycStatus: 'Not Started',
            createdAt: serverTimestamp(),
            handle: handle,
            handleLastUpdatedAt: null,
            handleEditCount: 0,
            walletBalance: 0,
        });

        // The Cloud Function will now ONLY handle setting the custom claim.
        // We add a small delay to allow the claim to be set before redirecting.
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
