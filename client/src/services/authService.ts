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
  async register(data: { name: string; email: string; password: string; phoneNumber: string }) {
    const res = await api.post("/auth/register", data);
    return res.data;
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
