import { Link, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cake, LayoutGrid, LogOut, Package, ShoppingBag, User as UserIcon } from "lucide-react";
import logo from "@/assets/logo.png";

export function Header() {
  const { isAuthenticated, isAdmin, email, openAuth, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const initial = (email?.[0] ?? "?").toUpperCase();
  const cartItemCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        
        <div className="flex items-center gap-4 order-1">
          {isAuthenticated ? (
            <>
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
                  <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>
                    <UserIcon className="ml-2 h-4 w-4" /> עדכון פרופיל
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout} className="text-destructive">
                    <LogOut className="ml-2 h-4 w-4" /> התנתקות
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* כפתורי סל והזמנות בסרגל העליון */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="hidden sm:flex" onClick={() => navigate({ to: "/orders" })}>
                  <Package className="ml-2 h-5 w-5 text-espresso" /> ההזמנות שלי
                </Button>
                <Button variant="ghost" className="relative" onClick={() => navigate({ to: "/cart" })}>
                  <ShoppingBag className="h-5 w-5 text-espresso" />
                  <span className="hidden sm:inline ml-2">הסל שלי</span>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 sm:right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-espresso">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </div>
            </>
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
          <img
            src={logo}
            alt="לוגו Sweets"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-sm"
          />
        </Link>
      </div>
    </header>
  );
}