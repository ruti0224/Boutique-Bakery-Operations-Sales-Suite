import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCog, Lock } from "lucide-react";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "אזור אישי" }] }),
});

// סכמת ולידציה רק לפרטים האישיים (ללא סיסמה)
const profileSchema = z.object({
  name: z.string().trim().min(2, "שם קצר מדי").max(50).optional().or(z.literal("")),
  email: z.string().trim().email("אימייל לא תקין").max(255).optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "טלפון חייב להכיל 10 ספרות")
    .optional()
    .or(z.literal("")),
});

function ProfilePage() {
  const { isAuthenticated, openAuth, userId, email } = useAuth();
  const navigate = useNavigate();

  // סטייט לטופס פרטים אישיים
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phoneNumber: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // סטייט לטופס שינוי סיסמה
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      openAuth();
      return;
    }
    if (userId) {
      setLoadingProfile(true);
      userService.getById(userId)
        .then((userData) => {
          setProfileForm({
            name: userData.name || "",
            email: userData.email || email || "",
            phoneNumber: userData.phoneNumber || "",
          });
        })
        .catch(() => toast.error("שגיאה בטעינת נתוני המשתמש"))
        .finally(() => setLoadingProfile(false));
    }
  }, [isAuthenticated, openAuth, userId, email]);

  // פונקציית שליחה לעדכון פרטים אישיים
  const submitProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("לא ניתן לזהות משתמש. התחבר/י מחדש");
      return;
    }
    const parsed = profileSchema.safeParse(profileForm);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoadingProfile(true);
    try {
      await userService.update(userId, parsed.data);
      toast.success("הפרטים עודכנו בהצלחה");
    } catch (err) {
      toast.error(extractError(err, "שגיאה בעדכון הפרופיל"));
    } finally {
      setLoadingProfile(false);
    }
  };

  // פונקציית שליחה לשינוי סיסמה
  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("לא ניתן לזהות משתמש. התחבר/י מחדש");
      return;
    }

    // ולידציה בצד הלקוח
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("הסיסמה החדשה ואימות הסיסמה אינם תואמים");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("סיסמה חדשה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoadingPassword(true);
    try {
      await userService.changePassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("הסיסמה שונתה בהצלחה!");
      // איפוס טופס הסיסמאות בלבד לאחר ההצלחה
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(extractError(err, "הסיסמה הנוכחית שגויה או שאירעה שגיאה אחרת"));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="font-display text-4xl font-bold text-espresso mb-8 flex items-center gap-3">
          <UserCog className="h-8 w-8 text-gold" /> אזור אישי
        </h1>

        <div className="space-y-8">
          
          {/* ----- טופס עדכון פרטים אישיים ----- */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">פרטים אישיים</h2>
            <form onSubmit={submitProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>שם מלא</Label>
                <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
              <Button type="submit" disabled={loadingProfile} className="w-full bg-espresso">
                {loadingProfile && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                שמירת פרטים
              </Button>
            </form>
          </Card>

          {/* ----- טופס שינוי סיסמה ----- */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" /> שינוי סיסמה
            </h2>
            <form onSubmit={submitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>סיסמה נוכחית</Label>
                <Input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>סיסמה חדשה</Label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>אימות סיסמה חדשה</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loadingPassword} className="w-full" variant="outline">
                {loadingPassword && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                עדכון סיסמה
              </Button>
            </form>
          </Card>

        </div>
      </section>
    </PublicShell>
  );
}