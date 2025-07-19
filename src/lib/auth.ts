
'use server';

import { auth, db } from './firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 

interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; // Allow other properties
}

async function getUserRole(user: any): Promise<string> {
    try {
        await user.getIdToken(true); // Force refresh the token
        const decodedToken = await user.getIdTokenResult();
        return decodedToken.claims.role || 'merchant';
    } catch (error) {
        console.error("Error getting user role from token:", error);
        // Fallback to Firestore if token check fails
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role) {
            return userDoc.data().role;
        }
        return 'merchant'; // Default role
    }
}


// Function to create a new user
export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // The Cloud Function will assign a custom claim.
        // We still write to Firestore for user profile data.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            // Role is now set by custom claim, but we can store it here too for reference
            role: 'merchant', 
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

// Function to sign in a user
export async function signInUser(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const role = await getUserRole(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        return { success: true, user: { uid: user.uid, role, ...userData } };
        
    } catch (error: any) {
        console.error("Error signing in:", error);
        return { success: false, error: error.message };
    }
}

// Function to sign in with Google or GitHub
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

        // Check if user exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user, create a document in Firestore. 
            // The Cloud Function will handle setting the custom claim.
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || 'Social User',
                avatar: user.photoURL,
                role: 'merchant', // Default role
                status: 'Active',
                plan: 'Free',
                createdAt: serverTimestamp(),
            });
        }
        
        const role = await getUserRole(user);
        const finalUserDoc = await getDoc(userDocRef);
        return { success: true, user: { uid: user.uid, role, ...finalUserDoc.data() } };

    } catch (error: any) {
        console.error(`Error with ${providerName} sign-in:`, error);
        // Handle specific errors like account-exists-with-different-credential
        if (error.code === 'auth/account-exists-with-different-credential') {
            return { success: false, error: 'An account already exists with the same email address but different sign-in credentials.' };
        }
        return { success: false, error: error.message };
    }
}


// Function to sign out the current user
export async function signOutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error("Error signing out:", error);
        return { success: false, error: error.message };
    }
}
