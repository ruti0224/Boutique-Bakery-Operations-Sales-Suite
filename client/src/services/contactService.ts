import { api } from "@/lib/api";

export const contactService = {
  send: (data: { name: string; email: string; message: string }) =>
    api.post<string>("/api/contact", data).then((r) => r.data),
};