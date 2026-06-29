import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/authService";
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
  }),
  component: ResetPasswordPage,
});

export default function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.resetPassword(token, password);
      alert("הסיסמה עודכנה בהצלחה!");
      navigate({ to: "/" });
    } catch (err) {
      alert("שגיאה בעדכון הסיסמה");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="סיסמה חדשה"
      />
      <button type="submit">שנה סיסמה</button>
    </form>
  );
}