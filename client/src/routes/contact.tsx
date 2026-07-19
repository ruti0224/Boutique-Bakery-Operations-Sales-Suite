import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { contactService } from "@/services/contactService";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "צור קשר — Sweets" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "שם קצר מדי").max(100),
  email: z.string().trim().email("אימייל לא תקין"),
  message: z.string().trim().min(5, "ההודעה קצרה מדי").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await contactService.send(parsed.data);
      toast.success("ההודעה נשלחה בהצלחה!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(extractError(err, "שגיאה בשליחת ההודעה"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/30 border border-gold/30 mb-4">
            <MessageCircle className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-display text-3xl font-bold text-espresso">צרו קשר</h1>
          <p className="text-muted-foreground mt-2">נשמח לשמוע מכם</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>הודעה</Label>
              <Textarea rows={5} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-espresso hover:bg-espresso/90">
              {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              שליחה
            </Button>
          </form>
        </Card>
      </section>
    </PublicShell>
  );
}