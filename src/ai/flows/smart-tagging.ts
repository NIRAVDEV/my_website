'use server';

/**
 * @fileOverview Provides AI-powered smart tagging for uploaded photos.
 *
 * - smartTagPhoto -  The function that suggests tags for a given photo.
 * - SmartTagPhotoInput - The input type for the smartTagPhoto function.
 * - SmartTagPhotoOutput - The return type for the smartTagPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTagPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate tags for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SmartTagPhotoInput = z.infer<typeof SmartTagPhotoInputSchema>;

const SmartTagPhotoOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the photo.'),
});
export type SmartTagPhotoOutput = z.infer<typeof SmartTagPhotoOutputSchema>;

export async function smartTagPhoto(input: SmartTagPhotoInput): Promise<SmartTagPhotoOutput> {
  return smartTagPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTagPhotoPrompt',
  input: {schema: SmartTagPhotoInputSchema},
  output: {schema: SmartTagPhotoOutputSchema},
  prompt: `You are an AI assistant that suggests relevant tags for photos.

  Based on the content of the photo, suggest at least 5 relevant tags that can be used to categorize and search for the image later. Return only the array of tags, and nothing else.

  Photo: {{media url=photoDataUri}}`,
});

const smartTagPhotoFlow = ai.defineFlow(
  {
    name: 'smartTagPhotoFlow',
    inputSchema: SmartTagPhotoInputSchema,
    outputSchema: SmartTagPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
