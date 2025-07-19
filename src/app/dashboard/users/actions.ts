
'use server';

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface User {
    id: string;
    fullName: string;
    email: string;
    plan?: string;
    status?: string;
    avatar?: string;
    role?: string;
}

export async function fetchUsers(): Promise<User[]> {
    try {
        // Using the standard client-aware 'db' instance.
        // The security rules have been updated to allow any authenticated user to read.
        const usersCollectionRef = collection(db, "users");
        const userSnapshot = await getDocs(usersCollectionRef);
        
        if (userSnapshot.empty) {
            console.log("No users found in the users collection.");
            return [];
        }
        
        const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
        
        return userList;

    } catch (error) {
        console.error("Error fetching users in Server Action: ", error);
        // We throw the error so the client-side component can catch it.
        throw new Error("Failed to fetch users. Check Firestore security rules and console logs.");
    }
}
