import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "http://localhost:8081";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function extractError(err: unknown, fallback = "אירעה שגיאה"): string {
  const e = err as any;
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (e?.message) return e.message;
  return fallback;
}
