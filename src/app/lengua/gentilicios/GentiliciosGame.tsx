"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gentiliciosData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { getLearningSuggestion } from '@/app/actions';
import type { SuggestNextTopicOutput } from '@/ai/flows/personalized-learning-path';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Question = typeof gentiliciosData[0];

const shuffleArray = (array: Question[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export function GentiliciosGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestNextTopicOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const startGame = useCallback(() => {
    setQuestions(shuffleArray(gentiliciosData).slice(0, 10)); // Play with 10 random questions
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer('');
    setFeedback(null);
    setIsAnswered(false);
    setIsFinished(false);
    setStartTime(Date.now());
    setAiSuggestion(null);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !userAnswer.trim()) return;

    setIsAnswered(true);
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.gentilicio.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setUserAnswer('');
      setFeedback(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleGetSuggestion = async () => {
    setIsAiLoading(true);
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // in minutes
    const finalScore = (score / questions.length) * 100;

    const result = await getLearningSuggestion([
      { topic: 'Gentilicios de España', score: finalScore, timeSpent },
    ]);

    if (result.success && result.data) {
      setAiSuggestion(result.data);
    }
    setShowSuggestion(true);
    setIsAiLoading(false);
  };

  if (isFinished) {
    return (
      <Card className="max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">¡Juego Terminado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">Tu puntuación final es:</p>
          <p className="text-5xl font-bold text-accent">{score} / {questions.length}</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={startGame}>Jugar de Nuevo</Button>
            <Button onClick={handleGetSuggestion} disabled={isAiLoading} className="bg-accent hover:bg-accent/90">
              <Lightbulb className="mr-2 h-4 w-4" />
              {isAiLoading ? 'Pensando...' : 'Pedir Sugerencia'}
            </Button>
          </div>
        </CardContent>
        <AlertDialog open={showSuggestion} onOpenChange={setShowSuggestion}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sugerencia de Repaso</AlertDialogTitle>
              <AlertDialogDescription>
                {aiSuggestion ? (
                  <>
                    <p className="font-bold text-lg text-primary mb-2">{aiSuggestion.suggestedTopic}</p>
                    <p>{aiSuggestion.reason}</p>
                  </>
                ) : "No se pudo obtener una sugerencia. Inténtalo de nuevo."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>¡Entendido!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <Card className="max-w-2xl mx-auto p-8 text-center">Cargando juego...</Card>;
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
        <CardDescription className="text-center text-lg">Pregunta {currentQuestionIndex + 1} de {questions.length}</CardDescription>
        <CardTitle className="text-2xl text-center py-4">¿Cuál es el gentilicio de <span className="font-bold text-primary">{currentQuestion.provincia}</span>?</CardTitle>
      </CardHeader>
      <form onSubmit={handleCheckAnswer}>
        <CardContent>
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Escribe aquí tu respuesta"
            className="text-center text-lg h-12"
            disabled={isAnswered}
          />
        </CardContent>
        <CardFooter className="flex-col items-center justify-center min-h-[120px]">
          {!isAnswered && (
            <Button type="submit" className="w-1/2" disabled={!userAnswer.trim()}>Comprobar</Button>
          )}
          {isAnswered && (
            <div className="flex flex-col items-center gap-4 text-center p-4 rounded-lg bg-muted w-full animate-in fade-in">
              {feedback === 'correct' ? (
                <p className="font-bold text-green-500 flex items-center gap-2"><CheckCircle2 /> ¡Correcto!</p>
              ) : (
                <p className="font-bold text-destructive text-xl flex items-center gap-2"><XCircle /> Incorrecto. La respuesta es "{currentQuestion.gentilicio}".</p>
              )}
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
              </Button>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
