import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { cakeService } from "@/services/cakeService";
import type { Order } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, MessageSquarePlus, Package } from "lucide-react";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "ההזמנות שלי" }] }),
});

const STATUS_LABEL: Record<string, string> = {
  PAID: "שולם",
  READY_FOR_PICKUP: "מוכן לאיסוף",
  DELIVERED: "נמסר",
  CANCELLED: "בוטל",
};

function OrdersPage() {
  const { isAuthenticated, openAuth, userId, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [recOpen, setRecOpen] = useState(false);
  const [recCakeId, setRecCakeId] = useState<number | null>(null);
  const [recText, setRecText] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    const loader = isAdmin
      ? orderService.getAllAdmin()
      : userId
        ? orderService.getByUser(userId).catch(() => orderService.getAllAdmin())
        : Promise.resolve([]);
    loader.then(setOrders).catch((e) => {
      toast.error(extractError(e, "טעינה נכשלה"));
      setOrders([]);
    });
  }, [isAuthenticated, isAdmin, userId, openAuth]);

  const submitRec = async () => {
    if (!recCakeId || !recText.trim()) return;
    try {
      await cakeService.recommend(recCakeId, recText.trim().slice(0, 500));
      toast.success("ההמלצה נוספה!");
      setRecOpen(false);
      setRecText("");
    } catch (err) {
      toast.error(extractError(err, "שגיאה בהוספת המלצה"));
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-bold text-espresso mb-8 flex items-center gap-3">
          <Package className="h-8 w-8 text-gold" /> ההזמנות שלי
        </h1>

        {orders === null ? (
          <p className="text-muted-foreground">טוען...</p>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">אין הזמנות עדיין</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Collapsible key={o.orderCode} asChild>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-secondary/40 transition">
                    <div className="text-right">
                      <p className="font-semibold text-espresso">הזמנה #{o.orderCode}</p>
                      <p className="text-sm text-muted-foreground">{o.orderDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-accent/40 text-espresso">
                        {STATUS_LABEL[o.status] ?? o.status}
                      </Badge>
                      <span className="font-bold text-gold">₪{o.totalPrice}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-5 pt-0 border-t border-border/40 space-y-2">
                      {(o.cakes ?? []).map((it) => (
                        <div key={it.code} className="flex items-center justify-between gap-4 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={it.cake?.imageUrl}
                              alt={it.cake?.name}
                              className="h-12 w-12 rounded-md object-cover bg-muted"
                            />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{it.cake?.name}</p>
                              <p className="text-xs text-muted-foreground">כמות: {it.quantity}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gold/40"
                            onClick={() => {
                              setRecCakeId(it.cake?.id ?? null);
                              setRecOpen(true);
                            }}
                          >
                            <MessageSquarePlus className="ml-1 h-4 w-4" /> המלצה
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </section>

      <Dialog open={recOpen} onOpenChange={setRecOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת המלצה</DialogTitle>
            <DialogDescription className="hidden">טופס להוספת המלצה לעוגה שנקנתה</DialogDescription>
          </DialogHeader>
          <Textarea
            value={recText}
            onChange={(e) => setRecText(e.target.value)}
            maxLength={500}
            placeholder="ספרו לאחרים מה אהבתם בעוגה..."
            rows={4}
          />
          <DialogFooter>
            <Button onClick={submitRec}>שלח המלצה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicShell>
  );
}
