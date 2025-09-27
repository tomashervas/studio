'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized stories and comprehension questions for children.
 *
 * - generateStory - A function that takes character names and a theme to generate a story.
 * - StoryGeneratorInput - The input type for the generateStory function.
 * - StoryGeneratorOutput - The return type for the generateStory function, including the story and questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StoryGeneratorInputSchema = z.object({
  studentName: z.string().describe('The name of the main character.'),
  friend1Name: z.string().describe('The name of the first friend.'),
  friend2Name: z.string().describe('The name of the second friend.'),
  theme: z.string().describe('The theme of the story (e.g., Fantasía, Ciencia Ficción).'),
});
export type StoryGeneratorInput = z.infer<typeof StoryGeneratorInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('The comprehension question.'),
  options: z.array(z.string()).length(3).describe('An array of 3 possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
});

const StoryGeneratorOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  story: z.string().describe('The generated story content.'),
  questions: z.array(QuestionSchema).describe('An array of comprehension questions about the story.'),
});
export type StoryGeneratorOutput = z.infer<typeof StoryGeneratorOutputSchema>;

export async function generateStory(input: StoryGeneratorInput): Promise<StoryGeneratorOutput> {
  return storyGeneratorFlow(input);
}

const storyGeneratorPrompt = ai.definePrompt({
  name: 'storyGeneratorPrompt',
  input: { schema: StoryGeneratorInputSchema },
  output: { schema: StoryGeneratorOutputSchema },
  prompt: `Eres un escritor de cuentos infantiles. Tu tarea es escribir una historia corta y atractiva para un niño de 9 años. La historia debe ser positiva, amigable y educativa, con el objetivo de mejorar la comprensión lectora.

**Instrucciones:**
1.  **Protagonistas:** La historia debe tener como protagonistas a {{studentName}}, {{friend1Name}}, y {{friend2Name}}. {{studentName}} es el personaje principal.
2.  **Tema:** La historia debe basarse en el siguiente tema: {{{theme}}}.
3.  **Tono y Contenido:** La historia debe ser siempre apropiada para un niño de 9 años. NO generes historias de miedo, violentas, polémicas, o que puedan causar cualquier tipo de malestar. El tono debe ser alegre, inspirador y con un mensaje positivo si es posible. La longitud debe ser apropiada para una lectura de aproximadamente 2 minutos.
4.  **Preguntas:** Después de la historia, crea 3 preguntas de opción múltiple para evaluar la comprensión lectora. Cada pregunta debe tener 3 opciones, y solo una debe ser la correcta. Asegúrate de que las preguntas se basen directamente en el contenido de la historia que has escrito.

**Ejemplo de formato de salida (en JSON):**
{
  "title": "El Misterio del Bosque Encantado",
  "story": "Había una vez, en un pueblo...",
  "questions": [
    {
      "question": "¿Qué encontraron los amigos en el bosque?",
      "options": ["Un tesoro", "Un mapa antiguo", "Un cachorro perdido"],
      "answer": "Un mapa antiguo"
    },
    ...
  ]
}

**Contexto de la historia a generar:**
-   **Protagonista principal:** {{studentName}}
-   **Amigos:** {{friend1Name}} y {{friend2Name}}
-   **Tema de la historia:** {{{theme}}}

Genera la historia y las preguntas en castellano.
`,
  config: {
    safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }
    ]
  }
});

const storyGeneratorFlow = ai.defineFlow(
  {
    name: 'storyGeneratorFlow',
    inputSchema: StoryGeneratorInputSchema,
    outputSchema: StoryGeneratorOutputSchema,
  },
  async input => {
    const { output } = await storyGeneratorPrompt(input);
    return output!;
  }
);
