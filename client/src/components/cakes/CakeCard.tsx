import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Cake } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { CakeDetailsModal } from "./CakeDetailsModal";

interface Props {
  cake: Cake;
}

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect fill='%23f3e9d8' width='400' height='300'/><text x='50%' y='50%' text-anchor='middle' fill='%23a08560' font-family='serif' font-size='24' dy='.3em'>עוגה</text></svg>";

export function CakeCard({ cake }: Props) {
  const { isAuthenticated, openAuth } = useAuth();
  const { add, remove, quantityOf } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const qty = quantityOf(cake.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    add(cake);
  };
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    if (qty > 0) remove(cake.id);
  };

  return (
    <>
      <Card
        className="group overflow-hidden cursor-pointer shadow-elegant hover:shadow-gold transition-all duration-500 hover:-translate-y-1 bg-card border-border/60 flex flex-col h-full"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted shrink-0">
          <img
            src={cake.imageUrl || FALLBACK}
            alt={cake.name}
            loading="lazy"
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK)}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {!cake.isActive && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-espresso font-bold">לא זמין</span>
            </div>
          )}
          {cake.category?.name && (
            <span className="absolute top-3 right-3 bg-background/85 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-espresso border border-gold/30">
              {cake.category.name}
            </span>
          )}
        </div>
        <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-espresso line-clamp-1">
              {cake.name}
            </h3>
            <span className="text-gold font-bold whitespace-nowrap">₪{cake.price}</span>
          </div>
          <div className="flex flex-col pt-2 border-t border-border/50">
            <div className="flex items-center justify-between gap-2">
              <Button
                size="icon"
                onClick={handleAdd}
                disabled={!cake.isActive}
                className="h-9 w-9 rounded-full bg-espresso hover:bg-espresso/90 text-primary-foreground shadow-gold"
                aria-label="הוסף"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold text-espresso min-w-[2rem] text-center">{qty}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={handleRemove}
                disabled={qty === 0 || !cake.isActive}
                className="h-9 w-9 rounded-full border-gold/40"
                aria-label="הפחת"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* התיקון כאן: האפקט מבוסס אך ורק על group-hover כדי להבטיח היעלמות מיידית ביציאת העכבר */}
            {qty > 0 && (
              <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 group-hover:mt-3">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: "/cart" });
                  }} 
                  variant="default" 
                  className="w-full bg-gold hover:bg-gold/90 text-espresso font-bold transition-all shadow-sm"
                >
                  <ShoppingCart className="ml-2 h-4 w-4" /> מעבר לעגלה
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
      <CakeDetailsModal cake={cake} open={open} onOpenChange={setOpen} />
    </>
  );
}