import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40 mt-20">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center mb-6">
          <img
            src={logo}
            alt="לוגו המאפייה"
            className="h-24 w-auto object-contain opacity-90 mb-4"
          />
          <p className="text-muted-foreground text-sm font-medium">נאפה באהבה, לחוויה בלתי נשכחת.</p>
        </div>
         </div>
    </footer>
  );
}
