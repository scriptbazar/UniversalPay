
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
import { setAdminClaimForCurrentUser } from './admin-actions';


interface UserData {
    fullName: string;
    mobile: string;
    [key: string]: any; 
}


async function getUserRole(user: User): Promise<string> {
    try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        return idTokenResult.claims.role || 'merchant';
    } catch (error) {
        console.error("Error getting user role from token:", error);
        // Fallback to Firestore if token check fails (e.g., in very rare cases)
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role) {
            return userDoc.data().role;
        }
        return 'merchant'; // Default role
    }
}


export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // The Cloud Function will assign a custom claim upon creation.
        // We still write to Firestore for user profile data.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            role: 'merchant', // Default role in Firestore
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


export async function signInUser(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // After successful sign-in, check if this user *should* be an admin.
        // This server action will set the claim if the email matches.
        await setAdminClaimForCurrentUser(user.uid);

        // Get the role and other data to return to the client.
        const role = await getUserRole(user);
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
        
        await setAdminClaimForCurrentUser(user.uid);
        const role = await getUserRole(user);
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
