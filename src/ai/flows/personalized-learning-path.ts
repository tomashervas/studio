'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting personalized learning paths based on a student's past performance.
 *
 * - suggestNextTopic - A function that takes a student's learning history and suggests the next topic to study.
 * - SuggestNextTopicInput - The input type for the suggestNextTopic function, including the student's learning history.
 * - SuggestNextTopicOutput - The return type for the suggestNextTopic function, suggesting the next topic to study.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single learning record
const LearningRecordSchema = z.object({
  topic: z.string().describe('The topic studied.'),
  score: z.number().describe('The score achieved on the topic (0-100).'),
  timeSpent: z
    .number()
    .describe('The time spent studying the topic in minutes.'),
});

// Define the input schema for the personalized learning path flow
const SuggestNextTopicInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  learningHistory: z
    .array(LearningRecordSchema)
    .describe('The student\'s past learning records.'),
  availableTopics: z
    .array(z.string())
    .describe('A list of topics available for studying.'),
});
export type SuggestNextTopicInput = z.infer<typeof SuggestNextTopicInputSchema>;

// Define the output schema for the personalized learning path flow
const SuggestNextTopicOutputSchema = z.object({
  suggestedTopic: z
    .string()
    .describe('The next topic suggested for the student to study.'),
  reason: z
    .string()
    .describe('The reason why this topic was suggested.'),
});
export type SuggestNextTopicOutput = z.infer<typeof SuggestNextTopicOutputSchema>;


export async function suggestNextTopic(input: SuggestNextTopicInput): Promise<SuggestNextTopicOutput> {
  return suggestNextTopicFlow(input);
}


const suggestNextTopicPrompt = ai.definePrompt({
  name: 'suggestNextTopicPrompt',
  input: {
    schema: SuggestNextTopicInputSchema,
  },
  output: {
    schema: SuggestNextTopicOutputSchema,
  },
  prompt: `Contesta en castellano al estudiante. You are an AI learning path optimizer.  Given a student's learning history, you will suggest the next best topic for them to study.

Student ID: {{{studentId}}}

Learning History:
{{#each learningHistory}}
- Topic: {{{topic}}}, Score: {{{score}}}, Time Spent: {{{timeSpent}}} minutes
{{/each}}

Available Topics:
{{#each availableTopics}}
- {{{this}}}
{{/each}}

Consider the following factors when suggesting the next topic:
* Topics with low scores should be prioritized.
* Topics where the student spent less time should be considered.
* Suggest topics that help the student build a solid foundation.
* Avoid repeating topics the student has already mastered.

Based on this information, what topic should the student study next?  Explain your reasoning.

Suggested Topic: {{suggestedTopic}}
Reason: {{reason}}`,
});

const suggestNextTopicFlow = ai.defineFlow(
  {
    name: 'suggestNextTopicFlow',
    inputSchema: SuggestNextTopicInputSchema,
    outputSchema: SuggestNextTopicOutputSchema,
  },
  async input => {
    const {output} = await suggestNextTopicPrompt(input);
    return output!;
  }
);
