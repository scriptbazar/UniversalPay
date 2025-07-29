
import type { LucideIcon } from "lucide-react";
import { DollarSign, Landmark, Users } from "lucide-react";

export type Notification = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    createdAt: string;
};

const adminNotifications: Notification[] = [
    {
        id: "notif_admin_1",
        title: "New Merchant Signup",
        description: "CreativeGoods (user_2) has just signed up.",
        icon: Users,
        createdAt: new Date().toISOString()
    },
    {
        id: "notif_admin_2",
        title: "Withdrawal Request",
        description: "MyStore.com requested a withdrawal of $500.",
        icon: Landmark,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
        id: "notif_admin_3",
        title: "High-Value Transaction",
        description: "A payment of $2,500 was processed for TechGadgets.",
        icon: DollarSign,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    }
];

const merchantNotifications: Notification[] = [
    {
        id: "notif_merchant_1",
        title: "Payment Received",
        description: "You received a payment of $150.00 from customer@example.com.",
        icon: DollarSign,
        createdAt: new Date().toISOString()
    },
    {
        id: "notif_merchant_2",
        title: "Withdrawal Completed",
        description: "Your withdrawal of $500.00 has been sent to your bank account.",
        icon: Landmark,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
        id: "notif_merchant_3",
        title: "New Support Reply",
        description: "Admin has replied to your ticket #TICK-12345.",
        icon: Users,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    }
];

export const getNotifications = (userType: 'admin' | 'merchant'): Notification[] => {
    return userType === 'admin' ? adminNotifications : merchantNotifications;
};
