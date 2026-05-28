import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/orderService";
import type { Order, OrderStatus } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES: OrderStatus[] = ["PAID", "READY_FOR_PICKUP", "DELIVERED", "CANCELLED"];
const LABEL: Record<OrderStatus, string> = {
  PAID: "שולם", READY_FOR_PICKUP: "מוכן לאיסוף", DELIVERED: "נמסר", CANCELLED: "בוטל",
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
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-espresso">ניהול הזמנות</h1>
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="סינון לפי קוד משתמש או שם"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <Card className="overflow-x-auto">
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
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">אין הזמנות</TableCell></TableRow>
            ) : filtered.map((o) => (
              <TableRow key={o.orderCode}>
                <TableCell>{o.orderCode}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{o.user?.name ?? "—"}</div>
                    <div className="text-muted-foreground">קוד: {o.user?.code ?? "—"}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{o.orderDate}</TableCell>
                <TableCell className="text-gold font-bold">₪{o.totalPrice}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.orderCode, v as OrderStatus)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{LABEL[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(o.orderCode)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
