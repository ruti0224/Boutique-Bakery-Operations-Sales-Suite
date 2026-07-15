  import { api } from "@/lib/api";
  import { jwtDecode } from "jwt-decode";

  export interface JwtPayload {
    sub?: string;
    email?: string;
    role?: string;
    roles?: string[];
    authorities?: string[];
    userId?: number;
    code?: number;
    id?: number;
    exp?: number;
    [k: string]: any;
  }

  export const authService = {
    async login(email: string, password: string): Promise<string> {
      const res = await api.post("/auth/login", { email, password });
      return typeof res.data === "string" ? res.data : (res.data?.token ?? "");
    },

    // 🔹 חדש: אימות טוקן גוגל מול השרת שלנו
    async googleLogin(googleToken: string): Promise<string> {
      const res = await api.post("/auth/google", { token: googleToken });
      return typeof res.data === "string" ? res.data : (res.data?.token ?? "");
    },

    // 🔹 חדש: שליחת בקשת התנתקות לשרת כדי לפסול את הטוקן (Blacklist)
    async logout(): Promise<void> {
      try {
        await api.post("/auth/logout");
      } catch (e) {
        console.error("שגיאה בהתנתקות מול השרת", e);
      }
    },

    async forgotPassword(email: string): Promise<string> {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    },

    async resetPassword(token: string, newPassword: string): Promise<string> {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      return res.data;
    },

    // 🔹 שודרג: כעת מחזיר את הטוקן (Auto-Login) בדיוק כמו ה-login
    async register(data: { name: string; email: string; password: string; phoneNumber: string }): Promise<string> {
      const res = await api.post("/auth/register", data);
      return typeof res.data === "string" ? res.data : (res.data?.token ?? "");
    },

    decode(token: string): JwtPayload | null {
      try {
        return jwtDecode<JwtPayload>(token);
      } catch {
        return null;
      }
    },

    isAdmin(payload: JwtPayload | null): boolean {
      if (!payload) return false;
      if (payload.role === "ROLE_ADMIN") return true;
      if (Array.isArray(payload.roles) && payload.roles.includes("ROLE_ADMIN")) return true;
      if (Array.isArray(payload.authorities) && payload.authorities.includes("ROLE_ADMIN")) return true;
      return false;
    },
  };