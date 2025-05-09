// This file is machine-generated - changes may be lost.

'use server';

/**
 * @fileOverview AI transaction categorization flow.
 *
 * This flow uses AI to categorize a transaction based on its description.
 *
 * @example
 * // Example usage:
 * const category = await categorizeTransaction({
 *   transactionDescription: 'Coffee at Starbucks',
 *   spendingCategories: ['Food', 'Transportation', 'Entertainment'],
 * });
 *
 * @example
 * // Input:
 * // {
 * //   transactionDescription: 'Lunch with client',
 * //   spendingCategories: ['Food', 'Transportation', 'Entertainment', 'Business Expenses'],
 * // }
 * //
 * // Output:
 * // 'Business Expenses'
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction to categorize.'),
  spendingCategories: z
    .array(z.string())
    .describe('An array of spending categories to choose from.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.string().describe('The predicted spending category for the transaction.');
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

/**
 * Categorizes a transaction using AI based on its description.
 * @param input The input containing the transaction description and available spending categories.
 * @returns The predicted spending category for the transaction.
 */
export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {
    schema: CategorizeTransactionInputSchema,
  },
  output: {
    schema: CategorizeTransactionOutputSchema,
  },
  prompt: `Given the following transaction description: "{{transactionDescription}}",
  categorize it into one of the following spending categories:
  {{#each spendingCategories}}
  - "{{this}}"
  {{/each}}

  Return ONLY the category name. Do not include any other text or explanation.
  If none of the categories are appropriate, return "Other".`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionPrompt(input);
    return output!;
  }
);
