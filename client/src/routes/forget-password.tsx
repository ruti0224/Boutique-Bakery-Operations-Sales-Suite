import { useState } from "react";
import { authService } from "@/services/authService";
import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { extractError } from "@/lib/api";

export const Route = createFileRoute('/forget-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage("success");
    } catch (err) {
      const msg = extractError(err, "");
      setMessage(msg || "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/30 border border-gold/30 mb-4">
            <Mail className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-espresso">שחזור סיסמה</h1>
          <p className="text-muted-foreground mt-2">הזינו את האימייל שלכם ונשלח קישור לאיפוס</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso hover:bg-espresso/90"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              שלח קישור לאיפוס
            </Button>
          </form>

          {message === "success" && (
            <div className="mt-4 p-4 rounded-lg bg-accent/20 border border-gold/30 text-center flex items-center gap-2 justify-center">
              <span className="text-green-600 text-lg">✓</span>
              <p className="text-sm text-espresso font-medium">
                נשלח קישור לאיפוס סיסמה למייל שלך!
              </p>
            </div>
          )}

          {message && message !== "success" && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-center flex items-center gap-2 justify-center">
              <span className="text-destructive text-lg">!</span>
              <p className="text-sm text-destructive font-medium">
                {message === "error"
                  ? "אירעה שגיאה, נסי שנית מאוחר יותר"
                  : message.includes("15 דקות")
                    ? "נשלח כבר קישור לאיפוס — יש להמתין 15 דקות לפני שליחה נוספת"
                    : message}
              </p>
            </div>
          )}
        </Card>
      </section>
    </PublicShell>
  );
}