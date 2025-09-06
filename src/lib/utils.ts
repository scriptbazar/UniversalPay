import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue.toDate === 'function') {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue === 'string') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  if (dateFieldValue && typeof dateFieldValue === 'number') {
    return new Date(dateFieldValue);
  }
  // Return a default or throw an error if the format is unrecognizable
  // Returning 'new Date()' might mask issues, but it's safer than crashing.
  return new Date(); 
};
