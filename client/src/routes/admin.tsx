import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Cake, ChartLine, Folder, ListOrdered, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "סקירה", icon: ChartLine, exact: true },
  { to: "/admin/cakes", label: "ניהול עוגות", icon: Cake },
  { to: "/admin/categories", label: "קטגוריות", icon: Folder },
  { to: "/admin/orders", label: "הזמנות", icon: ListOrdered },
  { to: "/admin/users", label: "משתמשים", icon: Users },
];

function AdminLayout() {
  const { isAuthenticated, isAdmin, logout, openAuth } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!isAuthenticated) {
    if (typeof window !== "undefined") openAuth();
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">נדרשת התחברות</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">גישה מוגבלת למנהלים בלבד</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-64 md:min-h-screen border-l border-border/60 bg-sidebar flex md:flex-col">
        <div className="p-6 border-b border-border/40 hidden md:block">
          <Link to="/" className="block">
            <h2 className="font-display text-2xl text-gradient-gold font-bold">מאפיית הזהב</h2>
            <p className="text-xs text-muted-foreground mt-1">פאנל ניהול</p>
          </Link>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 flex-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  active
                    ? "bg-espresso text-primary-foreground shadow"
                    : "text-foreground hover:bg-accent/40"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40 hidden md:block">
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
            <LogOut className="ml-2 h-4 w-4" /> התנתקות
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
