'use server';

import { extractDataFromDocument } from '@/ai/flows/extract-data-from-document';
import type { ExtractDataFromDocumentOutput } from '@/ai/flows/extract-data-from-document';
import { extractFormSchema } from '@/ai/flows/extract-form-schema';
import type { ExtractFormSchemaOutput } from '@/ai/flows/extract-form-schema';
import { mapDocumentToForm } from '@/ai/flows/map-document-to-form';
import type { MapDocumentToFormOutput } from '@/ai/flows/map-document-to-form';

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

export async function mapDocumentToFormAction(
  documentDataUri: string,
  formFields: string[]
): Promise<MapDocumentToFormOutput | { error: string }> {
  try {
    if (!documentDataUri) {
      return { error: 'Source document data is missing.' };
    }
    if (!formFields || formFields.length === 0) {
        return { error: 'No form fields provided to map to.' };
    }
    const result = await mapDocumentToForm({ documentDataUri, formFields });
    return result;
  } catch (error) {
    console.error('Error mapping document to form:', error);
    return { error: 'Failed to map the document data to the form. Please try again.' };
  }
}
