import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { CakeCard } from "@/components/cakes/CakeCard";
import { CakeGridSkeleton } from "@/components/cakes/CakeGridSkeleton";
import { cakeService } from "@/services/cakeService";
import { categoryService } from "@/services/categoryService";
import type { Cake, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "קטגוריות — מאפיית הזהב" },
      { name: "description", content: "סינון עוגות לפי קטגוריה." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cakes, setCakes] = useState<Cake[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    cakeService.getAll().then(setCakes).catch((e) => {
      toast.error(extractError(e, "טעינה נכשלה"));
      setCakes([]);
    });
    categoryService.getAll().then(setCats).catch(() => {});
  }, []);

  const derivedCats = useMemo(() => {
    if (cats.length) return cats;
    const map = new Map<number, Category>();
    (cakes ?? []).forEach((c) => {
      if (c.category && !map.has(c.category.categoryCode)) map.set(c.category.categoryCode, c.category);
    });
    return Array.from(map.values());
  }, [cats, cakes]);

  const filtered = useMemo(() => {
    if (!cakes) return null;
    if (active === null) return cakes;
    return cakes.filter((c) => c.category?.categoryCode === active);
  }, [cakes, active]);

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-espresso text-center">קטגוריות</h1>
        <p className="text-center text-muted-foreground mt-2">בחרו קטגוריה לסינון העוגות</p>

        <div className="flex flex-wrap justify-center gap-2 my-8">
          <Button
            variant={active === null ? "default" : "outline"}
            onClick={() => setActive(null)}
            className={active === null ? "bg-espresso text-primary-foreground" : ""}
          >
            הכל
          </Button>
          {derivedCats.map((c) => (
            <Button
              key={c.categoryCode}
              variant={active === c.categoryCode ? "default" : "outline"}
              onClick={() => setActive(c.categoryCode)}
              className={active === c.categoryCode ? "bg-espresso text-primary-foreground" : "border-gold/40"}
            >
              {c.name}
            </Button>
          ))}
        </div>

        {filtered === null ? (
          <CakeGridSkeleton />
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">אין עוגות בקטגוריה זו</p>
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
