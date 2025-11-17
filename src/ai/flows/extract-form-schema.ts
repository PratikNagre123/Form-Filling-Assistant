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


const FormFieldSchema = z.object({
    name: z.string().describe("The label of the identified form field (e.g., 'Full Name', 'Applicant Photo')."),
    type: z.enum(['text', 'checkbox', 'photo', 'signature', 'date']).describe("The type of the form field."),
});

const ExtractFormSchemaOutputSchema = z.object({
    fields: z.array(FormFieldSchema).describe("An array of objects, where each object represents a field identified in the form."),
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

  Analyze the provided document image or PDF. Identify every field that a user is meant to fill in. This includes text inputs, checkboxes, signature areas, date fields, and photo placeholders.

  Return a JSON object containing a single key "fields". This key should hold an array of objects, where each object has two properties:
  1. "name": The label of the identified form field (e.g., "Full Name", "Date of Birth", "Applicant Photo").
  2. "type": The type of the field. Use one of the following values: 'text', 'checkbox', 'photo', 'signature', 'date'.

  - Use 'photo' for any area designated for a passport photo or other image.
  - Use 'signature' for signature lines.
  - Use 'date' for date fields.
  - Use 'checkbox' for checkboxes.
  - Use 'text' for all other text-based inputs (like name, address, etc.).

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
