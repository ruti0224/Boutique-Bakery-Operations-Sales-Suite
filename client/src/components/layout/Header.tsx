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
import {
  LayoutGrid,
  LogOut,
  Package,
  ShoppingBag,
  User as UserIcon,
  MessageCircle,
} from "lucide-react";
import logo from "@/assets/logo.png";

export function Header() {
  const { isAuthenticated, isAdmin, email, openAuth, logout } = useAuth();
  const navigate = useNavigate();

  const initial = (email?.[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        {/* Profile and Links Menu */}
        <div className="flex items-center gap-4 order-1">
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
                <DropdownMenuLabel className="truncate">
                  {email ?? "משתמש"}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => navigate({ to: "/profile" })}
                >
                  <UserIcon className="ml-2 h-4 w-4" />
                  עדכון פרופיל
                </DropdownMenuItem>

                {/* מופיע רק בנייד */}
                <DropdownMenuItem
                  onSelect={() => navigate({ to: "/cart" })}
                  className="sm:hidden"
                >
                  <ShoppingBag className="ml-2 h-4 w-4" />
                  הסל שלי
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => navigate({ to: "/orders" })}
                  className="sm:hidden"
                >
                  <Package className="ml-2 h-4 w-4" />
                  ההזמנות שלי
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem
                    onSelect={() => navigate({ to: "/admin" })}
                    className="sm:hidden"
                  >
                    <LayoutGrid className="ml-2 h-4 w-4" />
                    פאנל ניהול
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={logout}
                  className="text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  התנתקות
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

          {/* צור קשר - תמיד מופיע וצמוד לפרופיל */}
          <Button
            asChild
            variant="ghost"
            className="text-espresso hover:text-gold hover:bg-gold/10"
          >
            <Link to="/contact">
              <MessageCircle className="ml-2 h-4 w-4" />
              צור קשר
            </Link>
          </Button>

          {/* שאר האפשרויות רק למשתמש מחובר */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1">
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate({ to: "/admin" })}
                  className="text-espresso hover:text-gold hover:bg-gold/10 font-semibold"
                >
                  <LayoutGrid className="ml-2 h-4 w-4" />
                  פאנל ניהול
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/cart" })}
                className="text-espresso hover:text-gold hover:bg-gold/10"
              >
                <ShoppingBag className="ml-2 h-4 w-4" />
                הסל שלי
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/orders" })}
                className="text-espresso hover:text-gold hover:bg-gold/10"
              >
                <Package className="ml-2 h-4 w-4" />
                ההזמנות שלי
              </Button>
            </div>
          )}
        </div>

        {/* Brand */}
        <Link
          to="/"
          className="order-2 absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
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