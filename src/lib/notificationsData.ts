
import type { LucideIcon } from "lucide-react";
import { DollarSign, Landmark, Users, ShieldCheck, Repeat, FileText } from "lucide-react";
import { db, auth } from './firebase'; // Import auth
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export type Notification = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    createdAt: string;
    userId?: string; // Add userId to the Notification type
};

// A map to convert audit log types to user-friendly notification content
const notificationTypeMap: { [key: string]: { icon: LucideIcon; title: (log: any) => string; } } = {
    USER_CREATED: { icon: Users, title: () => "New Merchant Signup" },
    ROLE_CHANGE: { icon: ShieldCheck, title: () => "User Role Changed" },
    STATUS_CHANGE: { icon: ShieldCheck, title: () => "User Status Changed" },
    SUBSCRIPTION_CHANGE: { icon: Repeat, title: (log) => `${log.details.to} Plan Activated` },
    MERCHANT_PROFILE_UPDATE: { icon: FileText, title: () => "Profile Updated" },
    FINANCIAL_ACTION: { icon: Landmark, title: () => "Withdrawal Processed" },
    WALLET_ADJUSTMENT: { icon: DollarSign, title: () => "Wallet Adjusted" },
};

export const getNotifications = async (userType: 'admin' | 'merchant', userId?: string): Promise<Notification[]> => {
    try {
        const notificationsCol = collection(db, 'notifications');
        let q;

        if (userType === 'admin') {
            // Admin can see all notifications
            q = query(notificationsCol, orderBy('createdAt', 'desc'), limit(10));
        } else if (userType === 'merchant') { // Explicitly check for merchant type
            const currentUserId = auth.currentUser?.uid; // Get current user ID
            if (!currentUserId) {
                 // If it's a merchant but no authenticated user, return empty.
                return [];
            }
            // Merchant sees their own notifications filtered by the authenticated user's ID
            q = query(notificationsCol, where('userId', '==', currentUserId), orderBy('createdAt', 'desc'), limit(10));
        } else {
            // For any other unexpected userType, return empty
            return [];
        }

        const notificationSnapshot = await getDocs(q);
        const notifications = notificationSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString() // Ensure date is formatted
        } as Notification));
        
        if (notifications.length === 0) {
             const defaultMessage = userType === 'admin' ? {
                id: 'default_admin_notif',
                title: 'System Ready',
                description: 'No new platform events to show.',
                icon: ShieldCheck,
                createdAt: new Date().toISOString(),
             } : {
                id: 'default_merchant_notif',
                title: 'Welcome!',
                description: 'No new notifications right now.',
                icon: Users,
                createdAt: new Date().toISOString(),
            };
            return [defaultMessage];
        }

        return notifications;

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [{
            id: 'error_notif',
            title: 'Error Loading Notifications',
            description: 'Could not fetch latest updates.',
            icon: ShieldCheck,
            createdAt: new Date().toISOString(),
        }];
    }
};

function docToNotification(doc: any): Notification {
    const notificationData = doc.data();
    // You might want to map specific fields from your notification document to the Notification type
    // For now, assuming direct mapping for title, description, and icon (if stored)
    return {
        id: doc.id,
        title: notificationData.title || 'No Title',
        description: notificationData.description || 'No description.',
        icon: notificationData.icon || Users, // Default icon if not specified
        createdAt: notificationData.createdAt?.toDate().toISOString() || new Date().toISOString(),
        userId: notificationData.userId || undefined,
    };
}
