import { api } from "@/lib/api";
import type { Category } from "@/types";

// Categories endpoints aren't explicitly in the controllers list shown, but a typical
// REST controller exists. Adjust path here if your backend differs.

export const categoryService = {
  getAll: () => api.get<Category[]>("/api/categories").then((r) => r.data),
  add: (c: Partial<Category>) => api.post<Category>("/api/categories/admin/add", c).then((r) => r.data),
  update: (id: number, c: Partial<Category>) =>
    api.put<void>(`/api/categories/admin/update/${id}?newName=${encodeURIComponent(c.name || '')}`).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/api/categories/admin/delete/${id}`).then((r) => r.data),
};