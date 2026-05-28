import { api } from "@/lib/api";
import type { Cake, OrderItem, User } from "@/types";

export const userService = {
  update: (id: number, user: Partial<User>) => api.put(`/api/users/${id}`, user).then((r) => r.data),
  getCart: (id: number) => api.get<OrderItem[]>(`/api/users/${id}/cart`).then((r) => r.data),
  addToCart: (id: number, cake: Cake) =>
    api.post<OrderItem[]>(`/api/users/${id}/cart/add`, cake).then((r) => r.data),
  removeFromCart: (userId: number, cakeId: number) =>
    api.delete<OrderItem[]>(`/api/users/${userId}/cart/remove/${cakeId}`).then((r) => r.data),
  getAllClients: () => api.get<User[]>("/api/users/admin/all").then((r) => r.data),
  // Optional admin delete (if endpoint exists)
  remove: (id: number) => api.delete(`/api/users/admin/${id}`).then((r) => r.data),
};
