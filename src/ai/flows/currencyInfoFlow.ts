
'use server';
/**
 * @fileOverview A flow to get information about a currency.
 * 
 * - getCurrencyInfo - A function that provides details about a currency, especially if it's not a standard one.
 * - CurrencyInfoInput - The input type for the getCurrencyInfo function.
 * - CurrencyInfoOutput - The return type for the getCurrencyInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const CurrencyInfoInputSchema = z.object({
  currency: z.string().describe('The name or symbol of the currency to inquire about.'),
});
export type CurrencyInfoInput = z.infer<typeof CurrencyInfoInputSchema>;

export const CurrencyInfoOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation about the currency.'),
});
export type CurrencyInfoOutput = z.infer<typeof CurrencyInfoOutputSchema>;

const currencyInfoPrompt = ai.definePrompt({
  name: 'currencyInfoPrompt',
  input: { schema: CurrencyInfoInputSchema },
  output: { schema: CurrencyInfoOutputSchema },
  prompt: `You are a helpful and witty financial assistant for a payment gateway called TransactWave. A user is asking about a currency that might not be in our standard list.

Your task is to provide a clear, concise, and slightly humorous explanation about the specified currency: {{{currency}}}.

- If it's a real-world currency, briefly describe it and mention if it's commonly traded.
- If it's a fictional currency (from a movie, game, etc.), identify its origin and explain what it is in a playful tone.
- If it's a cryptocurrency, explain what it is and its general purpose. Mention that while we support major cryptocurrencies like BTC and ETH, we may not support every single one for direct conversion yet.
- If the input is nonsensical, politely state that you couldn't identify it as a currency.

Keep the response to 2-3 sentences.
`,
});

const getCurrencyInfoFlow = ai.defineFlow(
  {
    name: 'getCurrencyInfoFlow',
    inputSchema: CurrencyInfoInputSchema,
    outputSchema: CurrencyInfoOutputSchema,
  },
  async (input) => {
    const { output } = await currencyInfoPrompt(input);
    if (!output) {
        throw new Error("Could not generate a response from the AI.");
    }
    return output;
  }
);

export async function getCurrencyInfo(input: CurrencyInfoInput): Promise<CurrencyInfoOutput> {
  return getCurrencyInfoFlow(input);
}
