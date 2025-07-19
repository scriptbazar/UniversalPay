
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
  prompt: `You are a helpful and witty financial assistant for a payment gateway called TransactWave. You are an expert on all official, government-issued (fiat) world currencies. A user is asking a question about a currency.

Your task is to provide a clear, concise, and helpful response based on the user's query about: {{{currency}}}.

Follow these rules:

1.  **If the user asks to convert a currency (e.g., "how much is 100 USD in INR?", "convert euros to pounds", "100 JPY me kitne INR hote hai"):**
    - Your primary goal is to identify a conversion request.
    - Do NOT provide a number or an exchange rate.
    - Politely explain that you don't have access to real-time exchange rates.
    - Instruct the user to use the "Live Currency Converter" tool on the page for accurate, up-to-the-minute conversions.

2.  **If the user asks for information about a specific currency:**
    - **Official Fiat Currency:** Briefly describe it, its origin, and common uses. This is your primary function.
    - **Cryptocurrency or Fictional Currency:** If the query is about a cryptocurrency (like Bitcoin, DogeCoin) or a fictional currency (like Gold Pressed Latinum), you MUST politely decline. State that you only provide information on official, government-issued currencies. Do not explain what the crypto or fictional currency is.

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
