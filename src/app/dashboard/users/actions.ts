
'use server';

// This file is being deprecated in favor of client-side data fetching
// to resolve the persistent permission issues. It can be safely removed.
// The logic has been moved to /src/app/dashboard/users/page.tsx.

export async function fetchUsers() {
    console.warn("fetchUsers server action is deprecated and should be removed.");
    return [];
}
