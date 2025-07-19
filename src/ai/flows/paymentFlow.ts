'use server';
/**
 * @fileOverview A flow to process incoming payments.
 * 
 * - processPayment - A function that simulates processing a payment.
 * - ProcessPaymentInput - The input type for the processPayment function.
 * - ProcessPaymentOutput - The return type for the processPayment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ProcessPaymentInputSchema = z.object({
  amount: z.number().describe('The amount to be paid.'),
  currency: z.string().describe('The currency of the payment (e.g., INR, USD).'),
  method: z.string().describe('The payment method used (e.g., UPI, Crypto, Card).'),
  customerId: z.string().describe('The ID of the customer making the payment.'),
});
export type ProcessPaymentInput = z.infer<typeof ProcessPaymentInputSchema>;

export const ProcessPaymentOutputSchema = z.object({
  transactionId: z.string().describe('The unique ID for the processed transaction.'),
  status: z.string().describe('The status of the payment (e.g., Success, Failed).'),
  message: z.string().describe('A message detailing the outcome of the payment.'),
});
export type ProcessPaymentOutput = z.infer<typeof ProcessPaymentOutputSchema>;

const processPaymentFlow = ai.defineFlow(
  {
    name: 'processPaymentFlow',
    inputSchema: ProcessPaymentInputSchema,
    outputSchema: ProcessPaymentOutputSchema,
  },
  async (input) => {
    // In a real application, you would add logic here to interact with a payment provider API.
    // For this example, we'll just simulate a successful payment.
    console.log('Processing payment for:', input);

    const transactionId = `txn_${Date.now()}`;
    
    return {
      transactionId,
      status: 'Success',
      message: `Payment of ${input.amount} ${input.currency} was successful.`,
    };
  }
);

export async function processPayment(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
  return processPaymentFlow(input);
}
