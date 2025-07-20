
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
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, limit } from "firebase/firestore";

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

async function isFirstUser(): Promise<boolean> {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

export async function createUser(email: string, password: string, additionalData: UserData) {
    try {
        const isFirst = await isFirstUser();
        const role = isFirst ? 'admin' : 'merchant';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // The Cloud Function 'addDefaultRoleClaim' will run and set the 'merchant' claim.
        // If this is the first user, we override it to 'admin' right after.
        if (isFirst) {
            await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
            console.log(`First user detected. Overriding claim to 'admin' for user: ${user.uid}`);
        }

        // Now save the user document to Firestore with the correct role.
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: additionalData.fullName,
            mobile: additionalData.mobile,
            role: role, // Save the determined role in Firestore
            status: 'Active',
            plan: 'Free',
            createdAt: serverTimestamp(),
        }, { merge: true });
        
        console.log(`User document created with role: ${role}`);
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
             const isFirst = await isFirstUser();
             role = isFirst ? 'admin' : 'merchant';

             // Set custom claim if it's the first user
             if (isFirst) {
                await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
             }

            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName || 'Social User',
                avatar: user.photoURL,
                role: role, 
                status: 'Active',
                plan: 'Free',
                createdAt: serverTimestamp(),
            }, { merge: true });
             console.log(`Social user created with role: ${role}`);
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
