
'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

/**
 * Updates a user's role in Firestore.
 * This is a server action and should be called from a secure context,
 * preferably after checking if the current user is an admin.
 * @param uid The UID of the user to update.
 * @param role The new role to assign ('admin' or 'merchant').
 * @returns An object indicating success or failure.
 */
export async function updateUserRole(uid: string, role: 'admin' | 'merchant') {
    if (!uid || !role) {
        return { success: false, error: 'User ID and role are required.' };
    }

    try {
        const userDocRef = doc(db, "users", uid);
        
        await updateDoc(userDocRef, {
            role: role
        });

        // Revalidate the path to ensure the UI updates with the new role.
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);

        return { success: true };

    } catch (error: any) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role. Please check server logs." };
    }
}
    
