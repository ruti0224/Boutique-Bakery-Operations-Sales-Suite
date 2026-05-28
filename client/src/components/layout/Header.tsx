import { Link, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cake, LayoutGrid, LogOut, Package, ShoppingBag, User as UserIcon } from "lucide-react";

export function Header() {
  const { isAuthenticated, isAdmin, email, openAuth, logout } = useAuth();
  const navigate = useNavigate();

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Profile (top-left in LTR; in RTL this becomes visually right; but spec says top-left) */}
        <div className="flex items-center gap-2 order-1">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-transparent hover:ring-gold transition">
                  <Avatar className="h-10 w-10 border border-gold/40">
                    <AvatarFallback className="bg-gradient-to-br from-amber-100 to-amber-300 text-espresso font-bold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="truncate">{email ?? "משתמש"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>
                    <LayoutGrid className="ml-2 h-4 w-4" /> פאנל ניהול
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => navigate({ to: "/cart" })}>
                  <ShoppingBag className="ml-2 h-4 w-4" /> הסל שלי
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/orders" })}>
                  <Package className="ml-2 h-4 w-4" /> ההזמנות שלי
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>
                  <UserIcon className="ml-2 h-4 w-4" /> עדכון פרופיל
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" /> התנתקות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={openAuth}
              className="rounded-full ring-2 ring-transparent hover:ring-gold transition"
              aria-label="התחברות"
            >
              <Avatar className="h-10 w-10 border border-border">
                <AvatarFallback className="bg-muted">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>

        {/* Brand */}
        <Link to="/" className="order-2 absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Cake className="h-6 w-6 text-gold" />
          <span className="font-display text-2xl font-bold text-gradient-gold tracking-tight">
            מאפיית הזהב
          </span>
        </Link>

        {/* Categories button */}
        <div className="order-3">
          <Button asChild variant="outline" className="border-gold/50 text-espresso hover:bg-accent/30">
            <Link to="/categories">
              <LayoutGrid className="ml-2 h-4 w-4" /> צפייה בקטגוריות
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
