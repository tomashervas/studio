import { AcentuacionGame } from './AcentuacionGame';

export default function AcentuacionPage() {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold font-headline text-center mb-8 text-primary">
        Juego de Acentuación
      </h1>
      <AcentuacionGame />
    </div>
  );
}
