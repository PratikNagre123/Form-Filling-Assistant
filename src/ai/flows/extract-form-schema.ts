'use server';

/**
 * @fileOverview Extracts a list of form fields from a given document (image or PDF).
 *
 * - extractFormSchema - A function that handles the form schema extraction.
 * - ExtractFormSchemaInput - The input type for the function.
 * - ExtractFormSchemaOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractFormSchemaInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "An image or PDF of a form, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractFormSchemaInput = z.infer<typeof ExtractFormSchemaInputSchema>;


const ExtractFormSchemaOutputSchema = z.object({
    fields: z.array(z.string()).describe("An array of strings, where each string is a field label identified in the form."),
});
export type ExtractFormSchemaOutput = z.infer<typeof ExtractFormSchemaOutputSchema>;


export async function extractFormSchema(input: ExtractFormSchemaInput): Promise<ExtractFormSchemaOutput> {
  return extractFormSchemaFlow(input);
}

const extractFormSchemaPrompt = ai.definePrompt({
  name: 'extractFormSchemaPrompt',
  input: {schema: ExtractFormSchemaInputSchema},
  output: {schema: ExtractFormSchemaOutputSchema},
  prompt: `You are an AI assistant that specializes in analyzing documents to identify and list all the input fields present in a form.

  Analyze the provided document image or PDF. Identify every field that a user is meant to fill in. This includes text inputs, checkboxes, signature areas, and date fields.

  Return a JSON object containing a single key "fields", which is an array of strings. Each string in the array should be the label of one identified form field.

  Example labels: "Full Name", "Date of Birth", "Home Address", "Signature", "I agree to the terms".

  Document:
  {{media url=documentDataUri}}
  `,
});

const extractFormSchemaFlow = ai.defineFlow(
  {
    name: 'extractFormSchemaFlow',
    inputSchema: ExtractFormSchemaInputSchema,
    outputSchema: ExtractFormSchemaOutputSchema,
  },
  async input => {
    const {output} = await extractFormSchemaPrompt(input);
    return output!;
  }
);

    