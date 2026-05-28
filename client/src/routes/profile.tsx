import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog } from "lucide-react";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "עדכון פרופיל" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "שם קצר מדי").max(50).optional().or(z.literal("")),
  email: z.string().trim().email("אימייל לא תקין").max(255).optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "טלפון חייב להכיל 10 ספרות")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים").max(100).optional().or(z.literal("")),
});

function ProfilePage() {
  const { isAuthenticated, openAuth, userId, email } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) openAuth();
    if (email) setForm((f) => ({ ...f, email }));
  }, [isAuthenticated, openAuth, email]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("לא ניתן לזהות משתמש. התחבר/י מחדש");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    // Only send fields the user actually filled in
    const payload: Record<string, unknown> = {};
    if (parsed.data.name) payload.name = parsed.data.name;
    if (parsed.data.email) payload.email = parsed.data.email;
    if (parsed.data.phoneNumber) payload.phoneNumber = parsed.data.phoneNumber;
    if (parsed.data.password) payload.password = parsed.data.password;

    if (Object.keys(payload).length === 0) {
      toast.error("יש למלא לפחות שדה אחד לעדכון");
      return;
    }

    setLoading(true);
    try {
      await userService.update(userId, payload);
      toast.success("הפרטים עודכנו בהצלחה");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(extractError(err, "שגיאה בעדכון"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="font-display text-4xl font-bold text-espresso mb-8 flex items-center gap-3">
          <UserCog className="h-8 w-8 text-gold" /> עדכון פרופיל
        </h1>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label>סיסמה חדשה (אופציונלי)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-espresso">
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              שמירה
            </Button>
          </form>
        </Card>
      </section>
    </PublicShell>
  );
}
