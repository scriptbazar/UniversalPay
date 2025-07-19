
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

const CurrencyInfoInputSchema = z.object({
  currency: z.string().describe('The name, symbol, or query about a currency.'),
});
export type CurrencyInfoInput = z.infer<typeof CurrencyInfoInputSchema>;

const CurrencyInfoOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation about the currency or the conversion query.'),
});
export type CurrencyInfoOutput = z.infer<typeof CurrencyInfoOutputSchema>;

const currencyInfoPrompt = ai.definePrompt({
  name: 'currencyInfoPrompt',
  input: { schema: CurrencyInfoInputSchema },
  output: { schema: CurrencyInfoOutputSchema },
  prompt: `You are a helpful and witty financial assistant for a payment gateway called TransactWave. You are an expert on all world currencies. A user is asking a question about a currency.

Your task is to provide a clear, concise, and helpful response based on the user's query about: {{{currency}}}.

Follow these rules:

1.  **If the user asks to convert a currency (e.g., "how much is 100 USD in INR?", "convert euros to pounds"):**
    - Do NOT provide a number or an exchange rate.
    - Politely explain that you don't have access to real-time exchange rates.
    - Instruct the user to use the "Live Currency Converter" tool on the page for accurate, up-to-the-minute conversions.

2.  **If the user asks for information about a specific currency:**
    - **Real-world currency:** Briefly describe it, its origin, and common uses.
    - **Fictional currency (from a movie, game, etc.):** Identify its origin and explain what it is in a playful tone.
    - **Cryptocurrency:** Explain what it is and its general purpose. Mention that TransactWave supports major cryptocurrencies like BTC and ETH, but may not support every single one for direct conversion yet.

3.  **If the input is nonsensical or not a currency:**
    - Politely state that you couldn't identify it as a currency and ask them to try again.

Keep the response to 2-4 sentences. Be friendly and professional.
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
