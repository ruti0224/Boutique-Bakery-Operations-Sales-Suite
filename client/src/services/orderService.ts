import { api } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";

export const orderService = {
  add: (order: Partial<Order>) => api.post("/api/orders/add", order).then((r) => r.data),
  getById: (id: number) => api.get<Order>(`/api/orders/${id}`).then((r) => r.data),
  getAllAdmin: () => api.get<Order[]>("/api/orders/admin/all").then((r) => r.data),
  updateStatus: (id: number, status: OrderStatus) =>
    api.patch(`/api/orders/admin/status/${id}`, null, { params: { status } }).then((r) => r.data),
  getByDate: (date: string) =>
    api.get<Order[]>("/api/orders/admin/by-date", { params: { date } }).then((r) => r.data),
  update: (id: number, order: Partial<Order>) =>
    api.put(`/api/orders/admin/update/${id}`, order).then((r) => r.data),
  getByUser: (userId: number) =>
    api.get<Order[]>(`/api/orders/admin/user/${userId}`).then((r) => r.data),
  // Admin delete (if endpoint exists)
  remove: (id: number) => api.delete(`/api/orders/admin/${id}`).then((r) => r.data),
};
