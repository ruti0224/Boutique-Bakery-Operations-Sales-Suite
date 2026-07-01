import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type JwtPayload } from "@/services/authService";

interface AuthContextValue {
  token: string | null;
  payload: JwtPayload | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: number | null;
  email: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  authOpen: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      const payload = authService.decode(t);
      if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setTokenState(null);
      } else {
        setTokenState(t);
      }
    }
  }, []);

  const setToken = useCallback((t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setTokenState(t);
  }, []);

  const logout = useCallback(() => setToken(null), [setToken]);

  const value = useMemo<AuthContextValue>(() => {
    const payload = token ? authService.decode(token) : null;
    const isAdmin = authService.isAdmin(payload);
    const userId =
      (payload?.userId as number | undefined) ??
      (payload?.code as number | undefined) ??
      (payload?.id as number | undefined) ??
      null;
    const email = (payload?.email as string | undefined) ?? (payload?.sub as string | undefined) ?? null;
    return {
      token,
      payload,
      isAuthenticated: !!token,
      isAdmin,
      userId,
      email,
      setToken,
      logout,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      authOpen,
    };
  }, [token, authOpen, setToken, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
