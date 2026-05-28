import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Sparkles } from "lucide-react";
import type { Cake } from "@/types";

interface Props {
  cake: Cake;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect fill='%23f3e9d8' width='400' height='300'/></svg>";

export function CakeDetailsModal({ cake, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" dir="rtl">
        <div className="aspect-[16/9] bg-muted overflow-hidden">
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

          <Separator />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-espresso mb-2">
              <MessageCircle className="h-4 w-4 text-gold" /> המלצות לקוחות
            </h4>
            {cake.recommendation && cake.recommendation.length > 0 ? (
              <ScrollArea className="max-h-40">
                <ul className="space-y-2">
                  {cake.recommendation.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm bg-secondary/50 rounded-lg p-3 border border-border/40"
                    >
                      “{r}”
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground italic">עדיין אין המלצות. היו הראשונים!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
