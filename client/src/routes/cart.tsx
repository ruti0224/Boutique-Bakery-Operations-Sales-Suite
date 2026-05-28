import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ShoppingBag } from "lucide-react";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
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

  useEffect(() => {
    if (!isAuthenticated) openAuth();
  }, [isAuthenticated, openAuth]);

  const checkout = async (method: "PayPal" | "Google Pay") => {
    if (!userId || items.length === 0) return;
    try {
      // Create order
      const today = new Date().toISOString().slice(0, 10);
      const delivery = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const order = await orderService.add({
        user: { code: userId } as any,
        orderDate: today,
        deliveryDate: delivery,
        totalPrice: total,
        status: "PAID",
        cakes: items as any,
      });
      const orderId = (order as any)?.orderCode ?? (order as any)?.id;
      // Process payment
      await paymentService.process({
        order: orderId ? ({ orderCode: orderId } as any) : undefined,
        amount: total,
        paymentDate: new Date().toISOString(),
        paymentMethod: method,
        paymentStatus: "SUCCESS",
        transactionId: `TX-${Date.now()}`,
      });
      toast.success(`התשלום ב-${method} התקבל בהצלחה`);
      clear();
      await refresh();
      navigate({ to: "/orders" });
    } catch (err) {
      toast.error(extractError(err, "שגיאה בתשלום"));
    }
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
                  src={item.cake.imageUrl}
                  alt={item.cake.name}
                  className="h-20 w-20 rounded-lg object-cover bg-muted"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0.3")}
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
              <div className="grid sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => checkout("PayPal")}
                  className="bg-[#003087] hover:bg-[#003087]/90 text-white h-12"
                >
                  שלם עם PayPal
                </Button>
                <Button
                  onClick={() => checkout("Google Pay")}
                  className="bg-foreground hover:bg-foreground/90 text-background h-12"
                >
                  שלם עם Google Pay
                </Button>
              </div>
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
