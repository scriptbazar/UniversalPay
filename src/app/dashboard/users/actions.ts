
'use server';

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This is a Server Action, which runs securely on the server.
// It is specifically designed to fetch all users from Firestore.
// The security rules on the client-side can remain strict because this
// action will be executed in a trusted server environment.

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
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        
        if (userSnapshot.empty) {
            console.log("No users found.");
            return [];
        }
        
        const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
        
        return userList;

    } catch (error) {
        console.error("Error fetching users in Server Action: ", error);
        // We throw the error so the client-side component can catch it and display a message.
        // It's better to return a structured error than to throw.
        throw new Error("You do not have permission to view users. Please check Firestore security rules.");
    }
}
