import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { orderService } from "@/services/orderService";
import type { Order, OrderStatus } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "READY_FOR_PICKUP", "DELIVERED", "CANCELLED"];
const LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT:"ממתין לתשלום", PAID: "שולם", READY_FOR_PICKUP: "מוכן לאיסוף", DELIVERED: "נמסר", CANCELLED: "בוטל",
};

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");

  const refresh = () => orderService.getAllAdmin().then(setOrders).catch((e) => toast.error(extractError(e)));
  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return orders;
    const f = filter.trim();
    return orders.filter((o) => String(o.user?.code ?? "").includes(f) || (o.user?.name ?? "").includes(f));
  }, [orders, filter]);

  const updateStatus = async (id: number, status: OrderStatus) => {
    try { await orderService.updateStatus(id, status); toast.success("עודכן"); refresh(); }
    catch (e) { toast.error(extractError(e)); }
  };

  const remove = async (id: number) => {
    try { await orderService.remove(id); toast.success("נמחק"); refresh(); }
    catch (e) { toast.error(extractError(e)); }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-espresso">ניהול הזמנות</h1>
      
      <div className="flex w-full">
        <Input
          placeholder="סינון לפי קוד משתמש או שם"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:max-w-xs bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border">אין הזמנות</div>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">משתמש</TableHead>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.orderCode}>
                    <TableCell className="font-bold">{o.orderCode}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{o.user?.name ?? "—"}</div>
                        <div className="text-muted-foreground">קוד: {o.user?.code ?? "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{o.orderDate}</TableCell>
                    <TableCell className="text-gold font-bold">₪{o.totalPrice}</TableCell>
                    <TableCell>
                      <Select defaultValue={o.status} onValueChange={(value) => updateStatus(o.orderCode, value as OrderStatus)}>
                        <SelectTrigger className="w-[140px] text-sm h-8"><SelectValue placeholder="בחר סטטוס" /></SelectTrigger>
                        <SelectContent dir="rtl">
                          {STATUSES.map((statusOption) => (
                            <SelectItem key={statusOption} value={statusOption}>{LABEL[statusOption]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(o.orderCode)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* מובייל: כרטיסיות נקיות ומוגבלות ברוחב */}
          <div className="md:hidden flex flex-col gap-3 w-full">
            {filtered.map((o) => (
              <Card key={o.orderCode} className="p-3.5 flex flex-col gap-3 border border-border/50 shadow-sm w-full">
                <div className="flex justify-between items-start w-full">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">הזמנה #{o.orderCode}</span>
                    <h3 className="font-bold text-sm text-espresso truncate">{o.user?.name ?? "לקוח לא ידוע"}</h3>
                  </div>
                  <div className="text-left shrink-0 pl-1">
                    <span className="text-[11px] text-muted-foreground block">{o.orderDate}</span>
                    <span className="text-gold font-bold text-base">₪{o.totalPrice}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1 pt-2.5 border-t border-border/50 w-full">
                  <div className="flex-1 min-w-0">
                    <Select defaultValue={o.status} onValueChange={(value) => updateStatus(o.orderCode, value as OrderStatus)}>
                      <SelectTrigger className="w-full text-xs h-9 bg-secondary/30"><SelectValue placeholder="בחר סטטוס" /></SelectTrigger>
                      <SelectContent dir="rtl">
                        {STATUSES.map((statusOption) => (<SelectItem key={statusOption} value={statusOption} className="text-xs">{LABEL[statusOption]}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive h-9 w-9 shrink-0" onClick={() => remove(o.orderCode)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}