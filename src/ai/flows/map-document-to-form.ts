'use server';

/**
 * @fileOverview This file defines a Genkit flow for mapping extracted document data to a dynamic form schema.
 *
 * It exports:
 * - `mapDocumentToForm`: An async function that takes document data and a list of form fields and returns a mapped JSON object.
 * - `MapDocumentToFormInput`: The TypeScript type for the input.
 * - `MapDocumentToFormOutput`: The TypeScript type for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MapDocumentToFormInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The source document (e.g., ID card), as a data URI that must include a MIME type and use Base64 encoding."
    ),
  formFields: z.array(z.string()).describe("An array of field labels from the custom form that needs to be filled."),
});

export type MapDocumentToFormInput = z.infer<typeof MapDocumentToFormInputSchema>;

// The output schema is dynamic, so we use a record type.
const MapDocumentToFormOutputSchema = z.object({
    mappedData: z.record(z.string()).describe("A JSON object where keys are the form fields and values are the extracted data.")
});

export type MapDocumentToFormOutput = z.infer<typeof MapDocumentToFormOutputSchema>;

export async function mapDocumentToForm(input: MapDocumentToFormInput): Promise<MapDocumentToFormOutput> {
  return mapDocumentToFormFlow(input);
}

const mapDocumentToFormPrompt = ai.definePrompt({
  name: 'mapDocumentToFormPrompt',
  input: {schema: MapDocumentToFormInputSchema},
  output: {
    format: 'json',
    schema: MapDocumentToFormOutputSchema
  },
  prompt: `You are an AI assistant that specializes in filling out forms. Your task is to extract information from a source document and map it to the fields of a given form.

  Here are the fields from the form that you need to fill:
  {{#each formFields}}
  - {{this}}
  {{/each}}

  Now, analyze the following source document and extract the information that corresponds to each of the form fields listed above.

  Source Document:
  {{media url=documentDataUri}}

  Return a single JSON object for the 'mappedData' key. The keys of this object must be the exact field names provided in the 'formFields' array. The values should be the corresponding information extracted from the source document.

  If you cannot find a value for a specific field, the value should be an empty string "". Do not omit any fields.
  `,
});

const mapDocumentToFormFlow = ai.defineFlow(
  {
    name: 'mapDocumentToFormFlow',
    inputSchema: MapDocumentToFormInputSchema,
    outputSchema: MapDocumentToFormOutputSchema,
  },
  async input => {
    const {output} = await mapDocumentToFormPrompt(input);
    return output!;
  }
);
