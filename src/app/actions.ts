'use server';

import { suggestNextTopic } from '@/ai/flows/personalized-learning-path';
import type { SuggestNextTopicInput } from '@/ai/flows/personalized-learning-path';

type LearningRecord = SuggestNextTopicInput['learningHistory'][0];

export async function getLearningSuggestion(learningHistory: LearningRecord[]) {
  try {
    const suggestion = await suggestNextTopic({
      studentId: 'student-01', // Mock student ID
      learningHistory,
      availableTopics: ['Gentilicios de España', 'Reglas de Acentuación', 'Acentuación Vocal'],
    });
    return { success: true, data: suggestion };
  } catch (error) {
    console.error('Error getting learning suggestion:', error);
    return { success: false, error: 'No se pudo obtener una sugerencia. Inténtalo de nuevo.' };
  }
}
