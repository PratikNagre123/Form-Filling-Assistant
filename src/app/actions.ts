'use server';

import { extractDataFromDocument } from '@/ai/flows/extract-data-from-document';
import type { ExtractDataFromDocumentOutput } from '@/ai/flows/extract-data-from-document';
import { extractFormSchema } from '@/ai/flows/extract-form-schema';
import type { ExtractFormSchemaOutput } from '@/ai/flows/extract-form-schema';


export async function extractDataAction(
  documentDataUri: string
): Promise<ExtractDataFromDocumentOutput | { error: string }> {
  try {
    if (!documentDataUri) {
      return { error: 'Document data is missing.' };
    }
    const extractedData = await extractDataFromDocument({ documentDataUri });
    return extractedData;
  } catch (error) {
    console.error('Error extracting data from document:', error);
    return { error: 'Failed to extract data from the document. Please try again.' };
  }
}

export async function extractFormSchemaAction(
  documentDataUri: string
): Promise<ExtractFormSchemaOutput | { error: string }> {
  try {
    if (!documentDataUri) {
      return { error: 'Form document data is missing.' };
    }
    const result = await extractFormSchema({ documentDataUri });
    return result;
  } catch (error) {
    console.error('Error extracting form schema:', error);
    return { error: 'Failed to extract the form structure. Please try again.' };
  }
}

    