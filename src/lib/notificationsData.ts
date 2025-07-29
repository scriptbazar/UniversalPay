
import type { LucideIcon } from "lucide-react";
import { DollarSign, Landmark, Users, ShieldCheck, Repeat, FileText } from "lucide-react";
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export type Notification = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    createdAt: string;
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
        const logsCol = collection(db, 'audit_logs');
        let q;

        if (userType === 'admin') {
            // Admin sees everything
            q = query(logsCol, orderBy('timestamp', 'desc'), limit(10));
        } else if (userId) {
            // Merchant sees their own relevant logs
            // This is a simplified query. A real app might have a dedicated 'notifications' collection for users.
            // For now, we'll fetch logs that might be relevant to a user.
            q = query(logsCol, where('details.targetUser', '==', userId), orderBy('timestamp', 'desc'), limit(10));
        } else {
            return [];
        }

        const logSnapshot = await getDocs(q);
        if (logSnapshot.empty && userType === 'merchant') {
             // Fallback for merchants to see their own direct actions if no targeted logs found
            q = query(logsCol, where('message', 'startsswith', `Merchant ${userId}`), orderBy('timestamp', 'desc'), limit(10));
            const selfActionSnapshot = await getDocs(q);
            const notifications = selfActionSnapshot.docs.map(docToNotification);
            if (notifications.length > 0) return notifications;
            
            // If still no logs, return a default notification
            return [{
                id: 'default_merchant_notif',
                title: 'Welcome!',
                description: 'No new notifications right now.',
                icon: Users,
                createdAt: new Date().toISOString(),
            }];
        }
        
        const notifications = logSnapshot.docs.map(docToNotification);
        
        if (notifications.length === 0) {
             return [{
                id: 'default_admin_notif',
                title: 'System Ready',
                description: 'No new platform events to show.',
                icon: ShieldCheck,
                createdAt: new Date().toISOString(),
            }];
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
    const log = doc.data();
    const eventType = notificationTypeMap[log.type] || { icon: Users, title: () => log.type };
    
    return {
        id: doc.id,
        title: eventType.title(log),
        description: log.message,
        icon: eventType.icon,
        createdAt: log.timestamp?.toDate().toISOString() || new Date().toISOString(),
    };
}
