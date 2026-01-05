'use server';

/**
 * @fileOverview This file defines a Genkit flow for mapping extracted document data to a dynamic form schema.
 *
 * It exports:
 * - `mapDocumentToForm`: An async function that takes document data and a list of form fields and returns a mapped JSON object.
 * - `MapDocumentToFormInput`: The TypeScript type for the input.
 * - `MapDocumentToFormOutput`: The TypeScript type for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MapDocumentToFormInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The source document (e.g., ID card), as a data URI that must include a MIME type and use Base64 encoding."
    ),
  formFields: z.array(z.string()).describe("An array of field labels from the custom form that needs to be filled."),
});

export type MapDocumentToFormInput = z.infer<typeof MapDocumentToFormInputSchema>;

// The public output schema matches what the application expects.
const MapDocumentToFormOutputSchema = z.object({
  mappedData: z.record(z.string()).describe("A JSON object where keys are the form fields and values are the extracted data.")
});

export type MapDocumentToFormOutput = z.infer<typeof MapDocumentToFormOutputSchema>;

export async function mapDocumentToForm(input: MapDocumentToFormInput): Promise<MapDocumentToFormOutput> {
  return mapDocumentToFormFlow(input);
}

// Internal schema for the LLM prompt to avoid "empty properties" error with z.record
const PromptOutputSchema = z.object({
  entries: z.array(z.object({
    fieldName: z.string(),
    extractedValue: z.string()
  })).describe("List of extracted field values")
});

const mapDocumentToFormPrompt = ai.definePrompt({
  name: 'mapDocumentToFormPrompt',
  input: { schema: MapDocumentToFormInputSchema },
  output: {
    format: 'json',
    schema: PromptOutputSchema
  },
  prompt: `You are an AI assistant that specializes in filling out forms. Your task is to extract information from a source document and map it to the fields of a given form.

  Here are the fields from the form that you need to fill:
  {{#each formFields}}
  - {{this}}
  {{/each}}

  Now, analyze the following source document and extract the information that corresponds to each of the form fields listed above.
  The document may be in an Indian language (Hindi, Marathi, Tamil, etc.). If so, extract the relevant data and translate/transliterate it to matching the form's expected language (usually English) unless otherwise specified.

  Source Document:
  {{media url=documentDataUri}}

  Return a JSON object containing an 'entries' array. Each entry should have:
  - 'fieldName': The exact name of the field from the provided list.
  - 'extractedValue': The corresponding information extracted from the source document.

  If you cannot find a value for a specific field, the 'extractedValue' should be an empty string "". Do not omit any fields.
  `,
});

const mapDocumentToFormFlow = ai.defineFlow(
  {
    name: 'mapDocumentToFormFlow',
    inputSchema: MapDocumentToFormInputSchema,
    outputSchema: MapDocumentToFormOutputSchema,
  },
  async input => {
    const { output } = await mapDocumentToFormPrompt(input);

    // Transform the array back into the record format expected by the app
    const mappedData: Record<string, string> = {};
    if (output && output.entries) {
      output.entries.forEach(entry => {
        mappedData[entry.fieldName] = entry.extractedValue;
      });
    }

    return { mappedData };
  }
);
