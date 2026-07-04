import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { CakeCard } from "@/components/cakes/CakeCard";
import { CakeGridSkeleton } from "@/components/cakes/CakeGridSkeleton";
import { cakeService } from "@/services/cakeService";
import type { Cake } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid } from "lucide-react";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sweets — דף הבית" },
      { name: "description", content: "גלריית עוגות יוקרה — הזמינו עוגות פרימיום עם משלוח." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [cakes, setCakes] = useState<Cake[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    cakeService
      .getAll()
      .then(setCakes)
      .catch((err) => {
        toast.error(extractError(err, "טעינת העוגות נכשלה"));
        setCakes([]);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!cakes) return null;
    const q = query.trim().toLowerCase();
    if (!q) return cakes;
    return cakes.filter((c) => c.name?.toLowerCase().includes(q));
  }, [cakes, query]);

  return (
    <PublicShell>

      {/* ═══════════════════════════════════════════
          HERO — כדי לשנות תמונה בעתיד:
          שמי תמונה חדשה ב־client/public/hero.jpg
          ושני את src ל־"/hero.jpg"
          ══════════════════════════════════════════ */}
     
      <section className="relative w-full overflow-hidden" style={{ height: "380px" }}>
        <img
          src="/hero.jpg" alt="עוגות"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* שכבה כהה קבועה קלה */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

        {/* אפקט hover — טשטוש + לוגו */}
        <div className="absolute inset-0 group flex items-center justify-center
                  hover:backdrop-blur-sm transition-all duration-500">
          <img
            src="/logo sweets.png"
            alt="Sweets"
            className="h-36 w-auto object-contain drop-shadow-2xl
                 opacity-0 group-hover:opacity-100
                 scale-90 group-hover:scale-100
                 transition-all duration-500"
          />
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          חיפוש + קטגוריות
          ══════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto">

          {/* שדה חיפוש */}
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gold pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש עוגה..."
              className="pr-11 h-12 text-base bg-card/80 border-gold/40 rounded-xl shadow-elegant"
              maxLength={80}
            />
          </div>

          {/* כפתור קטגוריות */}
          <Button
            asChild
            variant="outline"
            className="h-12 px-6 border-gold/50 text-espresso hover:bg-accent/30 rounded-xl whitespace-nowrap w-full sm:w-auto"
          >
            <Link to="/categories">
              <LayoutGrid className="ml-2 h-5 w-5" />
              צפייה בקטגוריות
            </Link>
          </Button>

        </div>
      </section>

      
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <p className="text-muted-foreground mt-1">בחרו את העוגה המושלמת לכם</p>
        </div>

        {filtered === null ? (
          <CakeGridSkeleton />
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">לא נמצאו עוגות</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <CakeCard key={c.id} cake={c} />
            ))}
          </div>
        )}
      </section>

    </PublicShell>
  );
}