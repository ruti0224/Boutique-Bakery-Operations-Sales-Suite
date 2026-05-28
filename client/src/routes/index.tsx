import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { CakeCard } from "@/components/cakes/CakeCard";
import { CakeGridSkeleton } from "@/components/cakes/CakeGridSkeleton";
import { cakeService } from "@/services/cakeService";
import type { Cake } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-cakes.jpg";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מאפיית הזהב — דף הבית" },
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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/30 text-espresso px-4 py-1.5 rounded-full text-sm border border-gold/30">
              <Sparkles className="h-4 w-4 text-gold" />
              קונדיטוריה בוטיק
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-espresso">
              עוגות יוקרה <br />
              <span className="text-gradient-gold">בנגיעה של זהב</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              כל עוגה נאפית באהבה, מחומרי גלם איכותיים. חוויית הזמנה אישית, מהירה ומפנקת.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש עוגה..."
                className="pr-10 bg-card/80 backdrop-blur"
                maxLength={80}
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 gradient-gold opacity-20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="עוגות יוקרה"
              width={1600}
              height={900}
              className="relative rounded-3xl shadow-elegant w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Cakes Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-espresso">הקולקציה</h2>
            <p className="text-muted-foreground mt-1">בחרו את העוגה המושלמת לכם</p>
          </div>
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
