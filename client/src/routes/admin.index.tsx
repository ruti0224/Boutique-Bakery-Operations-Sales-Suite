import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cake, ListOrdered, Users, Wallet, Clock, CheckCircle2, Package, Truck, XCircle, CheckCircle, XOctagon } from "lucide-react";
import { cakeService } from "@/services/cakeService";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    cakes: { total: 0, active: 0, inactive: 0 },
    orders: { total: 0, pending: 0, paid: 0, ready: 0, delivered: 0, cancelled: 0 },
    users: 0,
    revenue: { total: 0, avg: 0 }
  });

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      cakeService.getAll(),
      orderService.getAllAdmin(),
      userService.getAllClients(),
    ]).then(([cRes, oRes, uRes]) => {
      const cakesList = cRes.status === "fulfilled" ? cRes.value : [];
      const ordersList = oRes.status === "fulfilled" ? oRes.value : [];
      const usersList = uRes.status === "fulfilled" ? uRes.value : [];

      const totalRevenue = ordersList.reduce((s: number, x: any) => s + (x.totalPrice ?? 0), 0);
      const paidOrders = ordersList.filter((o: any) => o.status === "PAID");

      setStats({
        cakes: {
          total: cakesList.length,
          active: cakesList.filter((c: any) => c.isActive).length,
          inactive: cakesList.filter((c: any) => !c.isActive).length
        },
        orders: {
          total: ordersList.length,
          pending: ordersList.filter((o: any) => o.status === "PENDING_PAYMENT").length,
          paid: paidOrders.length,
          ready: ordersList.filter((o: any) => o.status === "READY_FOR_PICKUP").length,
          delivered: ordersList.filter((o: any) => o.status === "DELIVERED").length,
          cancelled: ordersList.filter((o: any) => o.status === "CANCELLED").length,
        },
        users: usersList.length,
        revenue: {
          total: totalRevenue,
          avg: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
        }
      });
    });
  }, []);

  const mainCards = [
    { id: "cakes", label: "עוגות", value: stats.cakes.total, icon: Cake },
    { id: "orders", label: "הזמנות", value: stats.orders.total, icon: ListOrdered },
    { id: "users", label: "משתמשים", value: stats.users, icon: Users },
    { id: "revenue", label: 'סה״כ הכנסות', value: `₪${stats.revenue.total.toFixed(0)}`, icon: Wallet },
  ];

  const detailsMap: Record<string, any[]> = {
    cakes: [
      { label: "פעילות", value: stats.cakes.active, icon: CheckCircle, color: "text-emerald-600" },
      { label: "לא פעילות", value: stats.cakes.inactive, icon: XOctagon, color: "text-red-600" },
    ],
    orders: [
      { label: "ממתין לתשלום", value: stats.orders.pending, icon: Clock, color: "text-amber-600" },
      { label: "שולם", value: stats.orders.paid, icon: CheckCircle2, color: "text-emerald-600" },
      { label: "מוכן לאיסוף", value: stats.orders.ready, icon: Package, color: "text-blue-600" },
      { label: "נמסר", value: stats.orders.delivered, icon: Truck, color: "text-indigo-600" },
      { label: "בוטל", value: stats.orders.cancelled, icon: XCircle, color: "text-red-600" },
    ],
    users: [
      { label: "לקוחות רשומים", value: stats.users, icon: Users, color: "text-blue-500" }
    ],
    revenue: [
      { label: "ממוצע להזמנה", value: `₪${stats.revenue.avg.toFixed(0)}`, icon: Wallet, color: "text-gold" },
      { label: "הזמנות ששולמו", value: stats.orders.paid, icon: CheckCircle2, color: "text-emerald-600" }
    ]
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-espresso mb-4">סקירה כללית</h1>
      
      {/* מגדירים items-start כדי שפתיחת אזור אחד לא תמתח את שאר העמודות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {mainCards.map((c) => (
          <div 
            key={c.id}
            className="flex flex-col gap-3"
            onMouseEnter={() => setHoveredCard(c.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* הכרטיס הראשי */}
            <Card 
              className="p-6 shadow-elegant cursor-pointer hover:border-gold/50 transition-colors"
              onClick={() => navigate({ to: `/admin/${c.id === 'revenue' ? 'payments' : c.id}` })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-bold text-espresso mt-1">{c.value}</p>
                </div>
                <c.icon className="h-10 w-10 text-gold/60" />
              </div>
            </Card>

            {/* אזור הפירוט שמופיע בדיוק מתחת לכרטיס הזה */}
            <div 
              className={`transition-all duration-500 overflow-hidden ${
                hoveredCard === c.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="grid grid-cols-2 gap-2 pb-2">
                {detailsMap[c.id].map((detail, index) => {
                  // אם יש מספר אי-זוגי של פריטים (כמו 5), הפריט האחרון יתפרס על שתי העמודות
                  const isLastOdd = detailsMap[c.id].length % 2 !== 0 && index === detailsMap[c.id].length - 1;
                  
                  return (
                    <Card 
                      key={index} 
                      className={`p-3 bg-card/60 shadow-sm border-border/50 flex flex-col items-center justify-center text-center gap-1 ${isLastOdd ? 'col-span-2' : ''}`}
                    >
                      <detail.icon className={`h-6 w-6 ${detail.color}`} />
                      <p className="text-xs font-medium text-muted-foreground mt-1">{detail.label}</p>
                      <p className="text-xl font-bold text-espresso">{detail.value}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}