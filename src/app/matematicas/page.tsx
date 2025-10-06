import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const topics = [
  {
    name: 'Operaciones Combinadas',
    description: 'Resuelve operaciones con paréntesis, sumas y restas.',
    href: '/matematicas/operaciones-combinadas',
    icon: <Calculator className="h-8 w-8" />,
  },
];

export default function MatematicasPage() {
  return (
    <div>
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
          Matemáticas
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Selecciona un tema para empezar a practicar.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic) => (
          <Link href={topic.href} key={topic.name} className="block">
            <Card className="h-full flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg">
                    {topic.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{topic.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{topic.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
