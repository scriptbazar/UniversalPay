
'use server';

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";
import { type Plan } from './page';

const functions = getFunctions(app);

export async function getSubscriptionPlans(): Promise<Plan[]> {
    try {
        const getPlans = httpsCallable(functions, 'getSubscriptionPlans');
        const result = await getPlans();
        return result.data as Plan[];
    } catch (error: any) {
        console.error("Error calling getSubscriptionPlans function:", error);
        return [];
    }
}

export async function createSubscriptionPlan(plan: Plan) {
     try {
        const createPlan = httpsCallable(functions, 'createSubscriptionPlan');
        const result = await createPlan(plan);
        return result.data as { success: boolean, error?: string };
    } catch (error: any) {
        console.error("Error calling createSubscriptionPlan function:", error);
        return { success: false, error: error.message };
    }
}

export async function updateSubscriptionPlan(plan: Plan) {
     try {
        const updatePlan = httpsCallable(functions, 'updateSubscriptionPlan');
        const result = await updatePlan(plan);
        return result.data as { success: boolean, error?: string };
    } catch (error: any) {
        console.error("Error calling updateSubscriptionPlan function:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubscriptionPlan(planId: string) {
      try {
        const deletePlan = httpsCallable(functions, 'deleteSubscriptionPlan');
        const result = await deletePlan({ id: planId });
        return result.data as { success: boolean, error?: string };
    } catch (error: any) {
        console.error("Error calling deleteSubscriptionPlan function:", error);
        return { success: false, error: error.message };
    }
}
