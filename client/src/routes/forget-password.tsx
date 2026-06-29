import { useState } from "react";
import { authService } from "@/services/authService";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/forget-password')({
  component: ForgotPasswordPage,
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage("אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה.");
    } catch (err) {
      setMessage("אירעה שגיאה בבקשה, נסה שנית.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h1 className="text-2xl mb-6">שחזור סיסמה</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          className="border p-2 rounded"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="הזינו את כתובת האימייל שלכם"
          required
        />
        <button
          className="bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
          type="submit"
          disabled={loading}
        >
          {loading ? "שולח..." : "שלח קישור לאיפוס"}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}