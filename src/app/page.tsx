import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calculator, FlaskConical } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const subjects = [
  {
    name: 'Lengua Castellana',
    href: '/lengua',
    icon: <BookOpen className="h-10 w-10" />,
    disabled: false,
  },
  {
    name: 'Matemáticas',
    href: '#',
    icon: <Calculator className="h-10 w-10" />,
    disabled: true,
  },
  {
    name: 'Ciencias',
    href: '#',
    icon: <FlaskConical className="h-10 w-10" />,
    disabled: true,
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'homepage-hero');

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
          ¡Bienvenido a Brainies!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige una asignatura para empezar a repasar y jugar. ¡Aprender nunca ha sido tan divertido!
        </p>
      </section>

      {heroImage && (
        <section className="mb-12 rounded-lg overflow-hidden shadow-xl">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            width={1200}
            height={400}
            className="w-full h-auto object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <Card key={subject.name} className={`transform transition-transform duration-300 hover:scale-105 hover:shadow-xl ${subject.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <CardHeader className="flex flex-col items-center text-center">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
                {subject.icon}
              </div>
              <CardTitle className="font-headline">{subject.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild disabled={subject.disabled} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                <Link href={subject.href}>Empezar a jugar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
