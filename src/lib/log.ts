// src/lib/log.ts

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ActivityLogEntry {
  userId: string; // The user performing the action
  userRole: 'merchant' | 'admin';
  action: string; // Description of the action (e.g., 'User logged in', 'Created payment link')
  timestamp: any; // Use any for now to accommodate serverTimestamp
  details?: { [key: string]: any }; // Optional additional details
}

interface AuditLogEntry extends ActivityLogEntry {
  targetUser?: string; // The user being acted upon (e.g., in a user edit by admin)
  ipAddress?: string; // Include IP address for audit logs (requires server-side detection)
}

// Function to log merchant activity
export const logActivity = async (entry: Omit<ActivityLogEntry, 'timestamp' | 'userRole'> & { userRole: 'merchant' }) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      ...entry,
      timestamp: serverTimestamp(),
    });
    console.log('Activity logged successfully.', entry.action);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Function to log admin audit events
export const logAuditEvent = async (entry: Omit<AuditLogEntry, 'timestamp' | 'userRole'> & { userRole: 'admin' }) => {
  try {
     // Note: Capturing IP address requires server-side logic (e.g., Cloud Functions)
    await addDoc(collection(db, 'audit_logs'), {
      ...entry,
      timestamp: serverTimestamp(),
       // Placeholder for IP address - needs to be added on the server
      ipAddress: 'N/A', 
    });
    console.log('Audit event logged successfully.', entry.action);
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
