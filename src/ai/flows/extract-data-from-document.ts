'use server';

/**
 * @fileOverview Extracts key information from an uploaded document using AI.
 *
 * - extractDataFromDocument - A function that handles the data extraction process.
 * - ExtractDataFromDocumentInput - The input type for the extractDataFromDocument function.
 * - ExtractDataFromDocumentOutput - The return type for the extractDataFromDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractDataFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      'A document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  targetLanguage: z.string().optional().default('English').describe('The target language to translate extracted information into.')
});
export type ExtractDataFromDocumentInput = z.infer<typeof ExtractDataFromDocumentInputSchema>;

const ExtractDataFromDocumentOutputSchema = z.object({
  name: z.string().optional().describe('The name extracted from the document.'),
  dob: z.string().optional().describe('The date of birth extracted from the document in YYYY-MM-DD format.'),
  gender: z.string().optional().describe('The gender extracted from the document.'),
  address: z.string().optional().describe('The address extracted from the document as a single string.'),
  aadhaar: z.string().optional().describe('The Aadhaar number extracted from the document.'),
  pan: z.string().optional().describe('The PAN number extracted from the document.'),
});

export type ExtractDataFromDocumentOutput = z.infer<typeof ExtractDataFromDocumentOutputSchema>;

export async function extractDataFromDocument(input: ExtractDataFromDocumentInput): Promise<ExtractDataFromDocumentOutput> {
  return extractDataFromDocumentFlow(input);
}

const extractDataFromDocumentPrompt = ai.definePrompt({
  name: 'extractDataFromDocumentPrompt',
  input: { schema: ExtractDataFromDocumentInputSchema },
  output: { schema: ExtractDataFromDocumentOutputSchema },
  prompt: `You are an expert data extraction specialist capable of reading documents in multiple languages.
  
  Extract the following information from the document provided.
  Translate/transliterate the extracted values to {{targetLanguage}}.
  For example, if the target language is Hindi, the Name and Address should be in Hindi script. Dates should standardized to YYYY-MM-DD.
  
  Return a JSON object with the following keys:
    - name: The name extracted from the document.
    - dob: The date of birth extracted from the document in YYYY-MM-DD format.
    - gender: The gender extracted from the document.
    - address: The address extracted from the document as a single string.
    - aadhaar: The Aadhaar number extracted from the document.
    - pan: The PAN number extracted from the document.

  If a piece of information is not present in the document, omit the corresponding field from the JSON output.

  Here is the document:

  {{media url=documentDataUri}}
  `,
});

const extractDataFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractDataFromDocumentFlow',
    inputSchema: ExtractDataFromDocumentInputSchema,
    outputSchema: ExtractDataFromDocumentOutputSchema,
  },
  async input => {
    const { output } = await extractDataFromDocumentPrompt(input);
    return output!;
  }
);
