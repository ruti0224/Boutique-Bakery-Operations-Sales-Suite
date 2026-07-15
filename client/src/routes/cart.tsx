import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ShoppingBag, Loader2, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";
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
  const [completedOrder, setCompletedOrder] = useState<{ id: number, total: number, items: any[] } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) openAuth();
  }, [isAuthenticated, openAuth]);

  const handleCheckout = async () => {
    if (!userId || items.length === 0) {
      toast.error("העגלה ריקה");
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const delivery = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      
      const newOrder = await orderService.add({
        orderDate: today,
        deliveryDate: delivery,
        status: "PENDING_PAYMENT", 
        notes: "הזמנה נשמרה - ממתינה לתשלום דרך וואטסאפ"
      });

      setCompletedOrder({ 
        id: newOrder.orderCode || newOrder.id, 
        total: total,
        items: [...items] 
      });

      toast.success("ההזמנה נקלטה במערכת בהצלחה!");
      clear(); 
      await refresh(); 
    } catch (err) {
      toast.error(extractError(err, "שגיאה ביצירת ההזמנה"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedOrder) {
    const businessPhone = "972504709484";
    let orderDetails = "";
    completedOrder.items.forEach(item => {
      orderDetails += `- ${item.cake.name} (כמות: ${item.quantity})\n`;
    });

    const textMessage = `שלום! ביצעתי הזמנה באתר:\n\n` +
                        `*פירוט ההזמנה:*\n` +
                        `${orderDetails}\n` +
                        `סך הכל לתשלום: *₪${completedOrder.total.toFixed(2)}*\n\n` +
                        `אשמח לקבל מספר להעברת תשלום (ביט/פייבוקס/העברה בנקאית). תודה!`;
                        
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(textMessage)}`;
    return (
      <PublicShell>
        <section className="container mx-auto px-4 py-12 max-w-4xl flex flex-col items-center mt-8">
          <CheckCircle className="h-16 w-16 text-gold mb-6" />
          <h1 className="font-display text-4xl font-bold text-espresso mb-4 text-center">
            ההזמנה נקלטה בהצלחה!
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-md">
            פרטי ההזמנה הועברו לבעלת העסק במייל. כדי לתאם את התשלום, נשמח שתשלחו לנו הודעה קצרה בוואטסאפ.
          </p>

          <Card className="p-8 w-full max-w-md bg-gradient-to-br from-secondary/60 to-accent/20 border-gold/30 text-center shadow-md">
            <div className="mb-6 space-y-3">
              <p className="text-lg text-espresso font-medium">
                מספר הזמנה: <strong>#{completedOrder.id}</strong>
              </p>
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-lg text-espresso">סה״כ לתשלום</span>
                <span className="text-4xl font-bold text-gradient-gold">₪{completedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-full"
            >
              <Button className="w-full bg-[#25D366] hover:bg-[#20b858] text-white h-14 text-lg shadow hover:shadow-md transition-all gap-2">
                <MessageCircle className="h-6 w-6" />
                לשליחת ההזמנה בוואטסאפ
              </Button>
            </a>
            
            <Button
              variant="ghost"
              className="mt-6 text-muted-foreground hover:text-espresso"
              onClick={() => navigate({ to: "/" })}
            >
              חזרה לדף הבית
            </Button>
          </Card>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-espresso flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-gold" /> הסל שלי
          </h1>
          <Button 
            variant="outline" 
            onClick={() => navigate({ to: "/" })}
            className="border-gold/50 text-espresso hover:bg-gold/10 transition-colors text-sm sm:text-base px-3 sm:px-4"
          >
            <ArrowRight className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">להמשך קנייה</span><span className="sm:hidden">חזור</span>
          </Button>
        </div>

        {!isAuthenticated ? (
          <p className="text-muted-foreground">התחבר כדי לצפות בסל</p>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">הסל ריק</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.code} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all">
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                  <img
                    src={item.cake.imageUrl || "https://placehold.co/100x100?text=No+Image"} 
                    alt={item.cake.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover bg-muted shrink-0"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=No+Image"; }}
                  />
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-espresso truncate text-base sm:text-lg">{item.cake.name}</h3>
                    <p className="text-sm text-muted-foreground">כמות: {item.quantity}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 gap-4">
                  <div className="text-gold font-bold whitespace-nowrap text-lg">
                    ₪{(item.cake.price * item.quantity).toFixed(2)}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(item.cake.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}

            <Card className="p-6 mt-6 bg-gradient-to-br from-secondary/60 to-accent/20 border-gold/30">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg">סה״כ לתשלום</span>
                <span className="text-3xl font-bold text-gradient-gold">₪{total.toFixed(2)}</span>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-espresso hover:bg-espresso/90 text-white h-14 text-lg"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> מבצע הזמנה...</>
                ) : (
                  "סיום ושליחת הזמנה"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                תועברו למסך סיכום עם קישור לשליחת ההזמנה לבעלת העסק
              </p>
            </Card>
          </div>
        )}
      </section>
    </PublicShell>
  );
}