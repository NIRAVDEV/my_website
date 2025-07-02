'use server';

/**
 * @fileOverview Provides AI-powered smart tagging for uploaded media.
 *
 * - smartTagMedia -  The function that suggests tags for a given photo or video.
 * - SmartTagMediaInput - The input type for the smartTagMedia function.
 * - SmartTagMediaOutput - The return type for the smartTagMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTagMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A photo or video to generate tags for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SmartTagMediaInput = z.infer<typeof SmartTagMediaInputSchema>;

const SmartTagMediaOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of relevant tags for the media.'),
});
export type SmartTagMediaOutput = z.infer<typeof SmartTagMediaOutputSchema>;

export async function smartTagMedia(input: SmartTagMediaInput): Promise<SmartTagMediaOutput> {
  return smartTagMediaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTagMediaPrompt',
  input: {schema: SmartTagMediaInputSchema},
  output: {schema: SmartTagMediaOutputSchema},
  prompt: `You are an AI assistant that suggests relevant tags for media.

  Based on the content of the media, suggest at least 5 relevant tags that can be used to categorize and search for it later. Return only the array of tags, and nothing else.

  Media: {{media url=mediaDataUri}}`,
});

const smartTagMediaFlow = ai.defineFlow(
  {
    name: 'smartTagMediaFlow',
    inputSchema: SmartTagMediaInputSchema,
    outputSchema: SmartTagMediaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
