export function Footer() {
  return (
    <footer className="bg-card/50 mt-auto py-6">
      <div className="container mx-auto px-4 md:px-6">
      <p className="text-center text-sm text-muted-foreground">
          Jose Tomás Hervás - Made with ❤️ for my dear son Marcel
        </p>
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Brainies. Aprender es divertido.
        </p>
      </div>
    </footer>
  );
}
