import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cake, ListOrdered, Users, Wallet } from "lucide-react";
import { cakeService } from "@/services/cakeService";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { paymentService } from "@/services/paymentService";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState({ cakes: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    Promise.allSettled([
      cakeService.getAll(),
      orderService.getAllAdmin(),
      userService.getAllClients(),
    ]).then(([c, o, u]) => {
      const cakes = c.status === "fulfilled" ? c.value.length : 0;
      const orders = o.status === "fulfilled" ? o.value.length : 0;
      const users = u.status === "fulfilled" ? u.value.length : 0;
      const revenue =
        o.status === "fulfilled" ? o.value.reduce((s: number, x) => s + (x.totalPrice ?? 0), 0) : 0;
      setStats({ cakes, orders, users, revenue });
    });
  }, []);

  const cards = [
    { label: "עוגות", value: stats.cakes, icon: Cake },
    { label: "הזמנות", value: stats.orders, icon: ListOrdered },
    { label: "משתמשים", value: stats.users, icon: Users },
    { label: 'סה״כ הכנסות', value: `₪${stats.revenue.toFixed(0)}`, icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-espresso">סקירה כללית</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold text-gradient-gold mt-1">{c.value}</p>
              </div>
              <c.icon className="h-10 w-10 text-gold/60" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
