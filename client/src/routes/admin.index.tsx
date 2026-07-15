import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cake, ListOrdered, Users, Wallet, Clock, CheckCircle2, Package, Truck, XCircle, CheckCircle, XOctagon, ChevronDown } from "lucide-react";
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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

  // הוספתי משתנה חדש: hasLink. רק מי שמוגדר כ-true יהיה כפתור לחיץ!
  const mainCards = [
    { id: "cakes", label: "עוגות", value: stats.cakes.total, icon: Cake, hasLink: true },
    { id: "orders", label: "הזמנות", value: stats.orders.total, icon: ListOrdered, hasLink: true },
    { id: "users", label: "משתמשים", value: stats.users, icon: Users, hasLink: true },
    { id: "revenue", label: 'סה״כ הכנסות', value: `₪${stats.revenue.total.toFixed(0)}`, icon: Wallet, hasLink: false },
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {mainCards.map((c) => {
          const isExpanded = hoveredCard === c.id || expandedCard === c.id;

          return (
            <div 
              key={c.id}
              className="flex flex-col gap-3"
              onMouseEnter={() => setHoveredCard(c.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card className="p-0 shadow-elegant overflow-hidden transition-colors border border-border/50 hover:border-gold/50 flex items-stretch">
                {/* כאן הוספתי תנאי: אם hasLink שווה true, זה לחיץ ויהיה אפקט מעבר צבע. אם false, זה רק טקסט רגיל */}
                <div 
                  className={`flex-1 p-6 ${c.hasLink ? 'cursor-pointer hover:bg-secondary/20 transition-colors' : ''}`}
                  onClick={() => {
                    if (c.hasLink) {
                      navigate({ to: `/admin/${c.id}` });
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{c.label}</p>
                      <p className="text-3xl font-bold text-espresso mt-1">{c.value}</p>
                    </div>
                    <c.icon className="h-10 w-10 text-gold/60" />
                  </div>
                </div>

                <div 
                  className="w-14 border-r border-border/50 flex items-center justify-center cursor-pointer hover:bg-secondary/60 bg-secondary/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(expandedCard === c.id ? null : c.id);
                  }}
                  aria-label="פתח פירוט"
                >
                  <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </Card>

              <div 
                className={`transition-all duration-500 overflow-hidden ${
                  isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {detailsMap[c.id].map((detail, index) => {
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
          );
        })}
      </div>
    </div>
  );
}