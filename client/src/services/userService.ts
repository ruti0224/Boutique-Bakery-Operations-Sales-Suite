import { api } from "@/lib/api";
import type { Cake, OrderItem, User } from "@/types";

export const userService = {
  update: (id: number, user: Partial<User>) => 
    api.put(`/api/users/${id}`, user).then((r) => r.data),
    
  getById: (id: number) => 
    api.get<User>(`/api/users/${id}`).then((r) => r.data),
    
  getCart: (id: number) => 
    api.get<OrderItem[]>(`/api/users/${id}/cart`).then((r) => r.data),
    
  addToCart: (id: number, cake: Cake) =>
    api.post<OrderItem[]>(`/api/users/${id}/cart/add`, cake).then((r) => r.data),
    
  removeFromCart: (userId: number, cakeId: number) =>
    api.delete<OrderItem[]>(`/api/users/${userId}/cart/remove/${cakeId}`).then((r) => r.data),
    
  getAllClients: () => 
    api.get<User[]>("/api/users/admin/all").then((r) => r.data),

  changePassword: (id: number, data: { oldPassword: string; newPassword: string }) =>
    api.put(`/api/users/${id}/change-password`, data).then((r) => r.data),

  remove: (id: number) => 
    api.delete(`/api/users/admin/${id}`).then((r) => r.data),
};