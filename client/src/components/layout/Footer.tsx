export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="font-display text-lg text-gradient-gold mb-2">מאפיית הזהב</p>
        <p>נאפה באהבה • עיצוב פרימיום © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
