import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authService } from "@/services/authService";
import { createFileRoute } from '@tanstack/react-router';
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (password !== confirm) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success("הסיסמה עודכנה בהצלחה!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error("שגיאה בעדכון הסיסמה, הקישור אולי פג תוקף");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/30 border border-gold/30 mb-4">
            <KeyRound className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-espresso">סיסמה חדשה</h1>
          <p className="text-muted-foreground mt-2">הזינו את הסיסמה החדשה שלכם</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה חדשה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">אימות סיסמה</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="הזינו שוב את הסיסמה"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso hover:bg-espresso/90"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              עדכון סיסמה
            </Button>
          </form>
        </Card>
      </section>
    </PublicShell>
  );
}