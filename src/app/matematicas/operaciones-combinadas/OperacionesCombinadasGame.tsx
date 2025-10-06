"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Operation {
  text: string;
  answer: number;
}

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOperation = (): Operation => {
  let num1, num2, num3, num4, op1, op3;
  
  // First parenthesis
  op1 = Math.random() > 0.5 ? '+' : '-';
  if (op1 === '+') {
    num1 = generateRandomNumber(10, 100);
    num2 = generateRandomNumber(10, 100);
  } else {
    num1 = generateRandomNumber(50, 200);
    num2 = generateRandomNumber(10, num1 - 10);
  }
  const res1 = op1 === '+' ? num1 + num2 : num1 - num2;

  // Second parenthesis
  op3 = Math.random() > 0.5 ? '+' : '-';
  if (op3 === '+') {
    num3 = generateRandomNumber(10, 100);
    num4 = generateRandomNumber(10, 100);
  } else {
    num3 = generateRandomNumber(50, 200);
    num4 = generateRandomNumber(10, num3 - 10);
  }
  const res2 = op3 === '+' ? num3 + num4 : num3 - num4;
  
  const op2 = Math.random() > 0.5 ? '+' : '-';
  let finalAnswer;

  if (op2 === '+') {
    finalAnswer = res1 + res2;
    return {
      text: `(${num1} ${op1} ${num2}) + (${num3} ${op3} ${num4})`,
      answer: finalAnswer,
    };
  } else {
    // Ensure the final result is not negative
    if (res1 >= res2) {
      finalAnswer = res1 - res2;
      return {
        text: `(${num1} ${op1} ${num2}) - (${num3} ${op3} ${num4})`,
        answer: finalAnswer,
      };
    } else {
      finalAnswer = res2 - res1;
      return {
        text: `(${num3} ${op3} ${num4}) - (${num1} ${op1} ${num2})`,
        answer: finalAnswer,
      };
    }
  }
};


export function OperacionesCombinadasGame() {
  const [questions, setQuestions] = useState<Operation[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalQuestions = 10;

  const startGame = useCallback(() => {
    const newQuestions = Array.from({ length: totalQuestions }, generateOperation);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer('');
    setFeedback(null);
    setIsAnswered(false);
    setIsFinished(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !userAnswer.trim()) return;

    setIsAnswered(true);
    const isCorrect = parseInt(userAnswer, 10) === currentQuestion.answer;
    
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
          </div>
        </CardContent>
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
        <CardTitle className="text-4xl text-center py-8 font-mono tracking-wider">{currentQuestion.text}</CardTitle>
      </CardHeader>
      <form onSubmit={handleCheckAnswer}>
        <CardContent>
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Escribe aquí el resultado"
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
                <p className="font-bold text-destructive text-xl flex items-center gap-2"><XCircle /> Incorrecto. La respuesta es {currentQuestion.answer}.</p>
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
