import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import type { Cake } from "@/types";

interface Props {
  cake: Cake;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect fill='%23f3e9d8' width='400' height='300'/></svg>";

export function CakeDetailsModal({ cake, open, onOpenChange }: Props) {
  const { isAuthenticated, openAuth } = useAuth();
  const { add, remove, quantityOf } = useCart();
  const navigate = useNavigate();
  const qty = quantityOf(cake.id);

  const handleAdd = () => {
    if (!isAuthenticated) return openAuth();
    add(cake);
  };
  const handleRemove = () => {
    if (!isAuthenticated) return openAuth();
    if (qty > 0) remove(cake.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">
        <div className="w-full overflow-y-auto">
          <div className="aspect-[16/9] bg-muted overflow-hidden shrink-0">
            <img
              src={cake.imageUrl || FALLBACK}
              alt={cake.name}
              className="w-full h-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK)}
            />
          </div>
          <div className="p-6 space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4">
                <DialogTitle className="text-2xl font-display text-espresso">{cake.name}</DialogTitle>
                <span className="text-2xl font-bold text-gradient-gold">₪{cake.price}</span>
              </div>
              {cake.category?.name && (
                <Badge variant="secondary" className="w-fit mt-1">
                  {cake.category.name}
                </Badge>
              )}
            </DialogHeader>

            <p className="text-muted-foreground leading-relaxed">{cake.description}</p>

            {cake.ingredients && (
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-espresso mb-1">
                  <Sparkles className="h-4 w-4 text-gold" /> מרכיבים
                </h4>
                <p className="text-sm text-muted-foreground">{cake.ingredients}</p>
              </div>
            )}

            {/* Redesigned Centered Quick Actions Box */}
            <div className="bg-gradient-to-b from-secondary/40 to-secondary/70 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 border border-border/60 my-6 max-w-sm mx-auto w-full">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">בחירת כמות</span>
              
              <div className="flex items-center bg-background border border-gold/30 rounded-full p-1.5 shadow-sm w-44 justify-between">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleRemove}
                  disabled={qty === 0 || !cake.isActive}
                  className="h-9 w-9 rounded-full text-espresso hover:bg-secondary shrink-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold text-espresso text-center flex-1">{qty}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleAdd}
                  disabled={!cake.isActive}
                  className="h-9 w-9 rounded-full text-espresso hover:bg-secondary shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {qty > 0 && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/cart" });
                  }}
                  className="bg-espresso hover:bg-espresso/90 text-white font-bold w-full h-11 rounded-xl shadow-md transition-all duration-300 mt-1"
                >
                  <ShoppingCart className="ml-2 h-4 w-4" /> מעבר לסל הקניות
                </Button>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="flex items-center gap-2 font-semibold text-espresso mb-2">
                <MessageCircle className="h-4 w-4 text-gold" /> המלצות לקוחות
              </h4>
              {cake.recommendation && cake.recommendation.length > 0 ? (
                <ul className="space-y-2 pb-2">
                  {cake.recommendation.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm bg-secondary/50 rounded-lg p-3 border border-border/40"
                    >
                      “{r}”
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">עדיין אין המלצות. היו הראשונים!</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}