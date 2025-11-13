import { config } from 'dotenv';
config();

import '@/ai/flows/extract-data-from-document.ts';
import '@/ai/flows/prefill-form-fields.ts';
import '@/ai/flows/extract-form-schema.ts';

    