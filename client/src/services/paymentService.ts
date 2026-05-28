import { api } from "@/lib/api";
import type { Payment } from "@/types";

export const paymentService = {
  process: (payment: Partial<Payment>) =>
    api.post<Payment>("/api/payments/process", payment).then((r) => r.data),
  getById: (id: number) => api.get<Payment>(`/api/payments/${id}`).then((r) => r.data),
  getAll: () => api.get<Payment[]>("/api/payments/admin/all").then((r) => r.data),
  getRevenue: (start: string, end: string) =>
    api
      .get<number>("/api/payments/admin/revenue", { params: { start, end } })
      .then((r) => r.data),
};
