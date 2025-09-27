'use server';

import { suggestNextTopic } from '@/ai/flows/personalized-learning-path';
import type { SuggestNextTopicInput } from '@/ai/flows/personalized-learning-path';
import { generateStory } from '@/ai/flows/story-generator';
import type { StoryGeneratorInput } from '@/ai/flows/story-generator';


type LearningRecord = SuggestNextTopicInput['learningHistory'][0];

export async function getLearningSuggestion(learningHistory: LearningRecord[]) {
  try {
    const suggestion = await suggestNextTopic({
      studentId: 'student-01', // Mock student ID
      learningHistory,
      availableTopics: ['Gentilicios de España', 'Reglas de Acentuación', 'Acentuación Vocal', 'Comprensión Lectora'],
    });
    return { success: true, data: suggestion };
  } catch (error) {
    console.error('Error getting learning suggestion:', error);
    return { success: false, error: 'No se pudo obtener una sugerencia. Inténtalo de nuevo.' };
  }
}

export async function getStory(input: StoryGeneratorInput) {
    try {
      const story = await generateStory(input);
      return { success: true, data: story };
    } catch (error) {
      console.error('Error generating story:', error);
      return { success: false, error: 'No se pudo generar la historia. Inténtalo de nuevo.' };
    }
  }
