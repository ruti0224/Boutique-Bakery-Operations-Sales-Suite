import { api } from "@/lib/api";
import type { Cake } from "@/types";

// Backend (Jackson) commonly serializes `boolean isActive` as `active`.
// Normalize both directions so the UI always has a reliable `isActive` flag.
const normalize = (c: any): Cake => ({
  ...c,
  isActive: typeof c?.isActive === "boolean" ? c.isActive : !!c?.active,
  ingredients: c?.ingredients ?? c?.cakeIngredients ?? "",
});

const toPayload = (cake: Partial<Cake>) => {
  const { id, recommendation, ...rest } = cake as any;
  const active = !!rest.isActive;
  return {
    ...rest,
    isActive: active,
    active, // dual-write for backend property naming
    ingredients: rest.ingredients ?? "",
  };
};

export const cakeService = {
  getAll: () => api.get<Cake[]>("/api/cakes/all").then((r) => (r.data ?? []).map(normalize)),
  search: (name: string) =>
    api.get<Cake[]>("/api/cakes/search", { params: { name } }).then((r) => (r.data ?? []).map(normalize)),
  add: (cake: Partial<Cake>) =>
    api.post<Cake>("/api/cakes/admin/add", toPayload(cake)).then((r) => normalize(r.data)),
  update: (id: number, cake: Partial<Cake>) =>
    api.put<Cake>(`/api/cakes/admin/update/${id}`, toPayload(cake)).then((r) => normalize(r.data)),
  uploadImage: (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<string>("/api/cakes/admin/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
},
  remove: (id: number) => api.delete(`/api/cakes/admin/delete/${id}`).then((r) => r.data),
  recommend: (cakeId: number, text: string) =>
    api.post<string[]>("/api/cakes/recommend", { cakeId, text }).then((r) => r.data),
};
