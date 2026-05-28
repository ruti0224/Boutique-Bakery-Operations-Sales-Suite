import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { paymentService } from "@/services/paymentService";
import type { Payment } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    paymentService.getAll().then(setPayments).catch(() => {});
  }, []);

  const calc = async () => {
    if (!start || !end) {
      toast.error("בחרו טווח תאריכים");
      return;
    }
    setLoading(true);
    try {
      const r = await paymentService.getRevenue(start, end);
      setRevenue(r);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-espresso">תשלומים והכנסות</h1>

      <Card className="p-6 bg-gradient-to-br from-secondary/40 to-accent/20">
        <h2 className="font-semibold text-espresso mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gold" /> דו״ח הכנסות
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2"><Label>מתאריך</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="space-y-2"><Label>עד תאריך</Label><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          <Button onClick={calc} disabled={loading} className="bg-espresso">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} חישוב
          </Button>
        </div>
        {revenue !== null && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">סה״כ הכנסות בטווח</p>
            <p className="text-4xl font-bold text-gradient-gold mt-1">₪{revenue.toFixed(2)}</p>
          </div>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">#</TableHead>
              <TableHead className="text-right">הזמנה</TableHead>
              <TableHead className="text-right">סכום</TableHead>
              <TableHead className="text-right">אמצעי</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">אין תשלומים</TableCell></TableRow>
            ) : payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.order?.orderCode ?? "—"}</TableCell>
                <TableCell className="text-gold font-bold">₪{p.amount}</TableCell>
                <TableCell>{p.paymentMethod}</TableCell>
                <TableCell>{p.paymentStatus}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.paymentDate?.slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
