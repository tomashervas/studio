"use client";

import React, { useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getStory } from '@/app/actions';
import type { StoryGeneratorOutput } from '@/ai/flows/story-generator';
import { Loader2, Wand2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

const storyThemes = [
    'Fantasía', 'Ciencia Ficción', 'Princesas', 'Deportes',
    'Misterio', 'Aventuras', 'Animales', 'Superhéroes',
    'Viajes en el tiempo', 'Magia'
];

const formSchema = z.object({
  studentName: z.string().min(2, { message: 'Tu nombre debe tener al menos 2 letras.' }),
  friend1Name: z.string().min(2, { message: 'El nombre de tu amigo debe tener al menos 2 letras.' }),
  friend2Name: z.string().min(2, { message: 'El nombre de tu otro amigo debe tener al menos 2 letras.' }),
  theme: z.string({ required_error: 'Por favor, elige un tema.' }),
});

type FormValues = z.infer<typeof formSchema>;
type QuestionWithUserAnswer = StoryGeneratorOutput['questions'][0] & { userAnswer?: string; isCorrect?: boolean };

export function ComprensionLectoraGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState<StoryGeneratorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionWithUserAnswer[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      friend1Name: '',
      friend2Name: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setStoryData(null);
    setError(null);
    const result = await getStory(data);
    if (result.success && result.data) {
      setStoryData(result.data);
      setQuestions(result.data.questions.map(q => ({...q, options: [...q.options].sort(() => Math.random() - 0.5) })));
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsFinished(false);
      setIsAnswered(false);
    } else {
      setError(result.error || 'Ocurrió un error desconocido.');
    }
    setIsLoading(false);
  };
  
  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (isAnswered) return;
    const newQuestions = [...questions];
    newQuestions[questionIndex].userAnswer = answer;
    setQuestions(newQuestions);
  };

  const handleCheckAnswer = () => {
    if(!questions[currentQuestionIndex].userAnswer) return;

    setIsAnswered(true);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.userAnswer === currentQuestion.answer;
    
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].isCorrect = isCorrect;
    setQuestions(newQuestions);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetGame = () => {
    setStoryData(null);
    setError(null);
    setIsFinished(false);
    form.reset();
  }

  const renderGame = () => {
    if (storyData && !isFinished) {
        const currentQuestion = questions[currentQuestionIndex];
    
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline text-primary">{storyData.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-lg leading-relaxed whitespace-pre-line">
                        {storyData.story}
                    </CardContent>
                </Card>
    
                <Card>
                    <CardHeader>
                        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mb-4" />
                        <CardTitle>Pregunta {currentQuestionIndex + 1}/{questions.length}</CardTitle>
                        <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            onValueChange={(value) => handleSelectAnswer(currentQuestionIndex, value)}
                            value={currentQuestion.userAnswer}
                            disabled={isAnswered}
                        >
                            {currentQuestion.options.map((option, i) => {
                                const isSelected = currentQuestion.userAnswer === option;
                                const isCorrect = currentQuestion.answer === option;
                                return (
                                    <FormItem 
                                        key={i} 
                                        className={cn("flex items-center space-x-3 space-y-0 p-4 rounded-lg border transition-all",
                                            isAnswered && isCorrect && "bg-green-500/20 border-green-500",
                                            isAnswered && isSelected && !isCorrect && "bg-destructive/20 border-destructive",
                                        )}
                                    >
                                        <FormControl>
                                            <RadioGroupItem value={option} />
                                        </FormControl>
                                        <FormLabel className="font-normal text-base w-full cursor-pointer">{option}</FormLabel>
                                    </FormItem>
                                );
                            })}
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex-col items-center justify-center min-h-[100px]">
                        {!isAnswered ? (
                            <Button onClick={handleCheckAnswer} disabled={!currentQuestion.userAnswer}>Comprobar</Button>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-center p-4 rounded-lg bg-muted w-full animate-in fade-in">
                                {currentQuestion.isCorrect ? (
                                    <p className="font-bold text-green-500 flex items-center gap-2"><CheckCircle2/> ¡Correcto!</p>
                                ) : (
                                    <p className="font-bold text-destructive text-xl flex items-center gap-2"><XCircle/> Incorrecto. La respuesta correcta es "{currentQuestion.answer}".</p>
                                )}
                                <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                                </Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        );
      }
    
      if(isFinished) {
        return (
            <Card className="max-w-2xl mx-auto text-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary">¡Has terminado!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">Tu puntuación final es:</p>
                <p className="text-5xl font-bold text-accent">{score} / {questions.length}</p>
                <div className="flex justify-center gap-4 pt-4">
                  <Button onClick={resetGame}>Crear otra historia</Button>
                </div>
              </CardContent>
            </Card>
          );
      }

      return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>¡Crea tu propia aventura!</CardTitle>
                <CardDescription>Dinos quiénes son los protagonistas y qué tipo de historia te gustaría leer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tu nombre</FormLabel>
                    <FormControl>
                        <Input placeholder="Escribe tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="friend1Name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre de un amigo/a</FormLabel>
                        <FormControl>
                            <Input placeholder="Amigo 1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="friend2Name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre de otro amigo/a</FormLabel>
                        <FormControl>
                            <Input placeholder="Amigo 2" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Elige un tema para la historia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tema..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {storyThemes.map(theme => (
                            <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {error && <p className="text-destructive text-center">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando historia...
                    </>
                ) : (
                    <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    ¡Generar mi historia!
                    </>
                )}
                </Button>
            </CardFooter>
            </Card>
        </form>
      );
  }

  return (
    <FormProvider {...form}>
        {renderGame()}
    </FormProvider>
  );
}
