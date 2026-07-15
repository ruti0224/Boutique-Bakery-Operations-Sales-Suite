import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Cake, Tags, ListOrdered, Users, Home } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  
  // הסרתי מכאן את כפתור ה"תשלומים" (Wallet)
  const navItems = [
    { to: "/admin", label: "סקירה", icon: LayoutDashboard },
    { to: "/admin/cakes", label: "עוגות", icon: Cake },
    { to: "/admin/categories", label: "קטגוריות", icon: Tags },
    { to: "/admin/orders", label: "הזמנות", icon: ListOrdered },
    { to: "/admin/users", label: "משתמשים", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background dir-rtl overflow-x-hidden max-w-[100vw] w-full">
      <div className="bg-white text-espresso border-b border-border shadow-sm sticky top-0 z-50 py-3 px-3 sm:px-4 w-full">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-full">
          
          <div className="flex items-center justify-between w-full sm:w-auto border-b sm:border-0 border-border/50 pb-3 sm:pb-0 gap-2">
            <div className="font-display text-xl sm:text-2xl font-bold text-gold flex items-center gap-2 truncate min-w-0">
              ניהול המערכת
            </div>
            
            <Button 
              variant="outline" 
              className="sm:hidden border-gold text-gold hover:bg-gold hover:text-espresso flex items-center gap-1.5 h-9 px-2.5 text-sm transition-colors shrink-0"
              onClick={() => navigate({ to: "/" })}
            >
              <Home className="h-4 w-4" /> לאתר
            </Button>
          </div>

          <nav className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-gold text-espresso font-bold shadow-sm" }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-md transition-all hover:bg-secondary text-sm sm:text-base font-medium"
                activeOptions={item.to === "/admin" ? { exact: true } : { exact: false }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <Button 
            variant="outline" 
            className="hidden sm:flex border-gold text-gold hover:bg-gold hover:text-espresso flex-items-center gap-2 transition-colors shrink-0"
            onClick={() => navigate({ to: "/" })}
          >
            <Home className="h-4 w-4" /> חזרה לאתר הראשי
          </Button>

        </div>
      </div>

      <main className="container mx-auto p-3 sm:p-6 lg:p-8 w-full max-w-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}