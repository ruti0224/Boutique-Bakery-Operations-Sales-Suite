import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import type { Cake, OrderItem } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

interface CartContextValue {
  items: OrderItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (cake: Cake) => Promise<void>;
  remove: (cakeId: number) => Promise<void>;
  quantityOf: (cakeId: number) => number;
  total: number;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userId } = useAuth();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await userService.getCart(userId);
      setItems(data ?? []);
    } catch (err) {
      // silent unless explicit
      console.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (cake: Cake) => {
    if (!userId) {
      toast.error("לא ניתן לזהות משתמש. התחבר/י מחדש");
      return;
    }
    try {
      const data = await userService.addToCart(userId, cake);
      setItems(data ?? []);
      toast.success(`${cake.name} נוסף לסל`);
    } catch (err) {
      toast.error(extractError(err, "שגיאה בהוספת מוצר"));
    }
  };

  const remove = async (cakeId: number) => {
    if (!userId) {
      toast.error("לא ניתן לזהות משתמש. התחבר/י מחדש");
      return;
    }
    try {
      const data = await userService.removeFromCart(userId, cakeId);
      setItems(data ?? []);
    } catch (err) {
      toast.error(extractError(err, "שגיאה בהסרת מוצר"));
    }
  };

  const quantityOf = (cakeId: number) =>
    items.filter((i) => i.cake?.id === cakeId).reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (i.cake?.price ?? 0) * (i.quantity ?? 1), 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    loading,
    refresh,
    add,
    remove,
    quantityOf,
    total,
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be within CartProvider");
  return ctx;
}
