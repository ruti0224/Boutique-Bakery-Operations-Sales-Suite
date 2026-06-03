import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { orderService } from "@/services/orderService";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "הסל שלי — מאפיית הזהב" }] }),
});

function CartPage() {
  const { isAuthenticated, openAuth, userId } = useAuth();
  const { items, total, remove, refresh, clear } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) openAuth();
  }, [isAuthenticated, openAuth]);

  const handleMockCheckout = async () => {
    if (!userId || items.length === 0) {
      toast.error("העגלה ריקה");
      return;
    }

    setIsProcessing(true); // מתחילים אנימציית טעינה

    // הדמיה (Mock) של המתנה לאישור מחברת האשראי במשך שנייה וחצי
    setTimeout(async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        // משלוח לעוד 3 ימים כברירת מחדל
        const delivery = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
        await orderService.add({
          orderDate: today,
          deliveryDate: delivery,
          status: "PAID",
          notes: "הזמנה שולמה באשראי (הדגמת פרויקט)"
        });

        toast.success("התשלום עבר בהצלחה! ההזמנה בדרך אליך.");
        clear(); // מרוקנים את העגלה בצד הלקוח
        await refresh(); // מסנכרנים שוב מול השרת
        navigate({ to: "/" }); // מעבירים את הלקוח לדף הבית בסיום
      } catch (err) {
        toast.error(extractError(err, "שגיאה ביצירת ההזמנה"));
      } finally {
        setIsProcessing(false);
      }
    }, 1000); 
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-espresso mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-gold" /> הסל שלי
        </h1>

        {!isAuthenticated ? (
          <p className="text-muted-foreground">התחבר כדי לצפות בסל</p>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">הסל ריק</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.code} className="p-4 flex items-center gap-4">
                <img
                  src={item.cake.imageUrl || "https://placehold.co/100x100?text=No+Image"} 
                  alt={item.cake.name}
                  className="h-20 w-20 rounded-lg object-cover bg-muted"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/100x100?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-espresso truncate">{item.cake.name}</h3>
                  <p className="text-sm text-muted-foreground">כמות: {item.quantity}</p>
                </div>
                <div className="text-gold font-bold whitespace-nowrap">
                  ₪{(item.cake.price * item.quantity).toFixed(2)}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(item.cake.id)}
                  className="text-destructive"
                  aria-label="הסר"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}

            <Card className="p-6 mt-6 bg-gradient-to-br from-secondary/60 to-accent/20 border-gold/30">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg">סה״כ לתשלום</span>
                <span className="text-3xl font-bold text-gradient-gold">₪{total.toFixed(2)}</span>
              </div>
              
              <Button
                onClick={handleMockCheckout}
                disabled={isProcessing}
                className="w-full bg-espresso hover:bg-espresso/90 text-white h-14 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    מעבד תשלום מאובטח...
                  </>
                ) : (
                  "לתשלום וסיום הזמנה"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                הסליקה מתבצעת בצורה מאובטחת דרך ספק חיצוני
              </p>
            </Card>
          </div>
        )}
      </section>
    </PublicShell>
  );
}