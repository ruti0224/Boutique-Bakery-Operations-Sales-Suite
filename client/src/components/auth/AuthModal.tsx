import { useState, type FormEvent, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { extractError } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Link } from "@tanstack/react-router";

const loginSchema = z.object({
  email: z.string().trim().email("אימייל לא תקין").max(255),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים").max(100),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "שם קצר מדי").max(50),
  email: z.string().trim().email("אימייל לא תקין").max(255),
  password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים").max(100),
  phoneNumber: z.string().regex(/^\d{10}$/, "טלפון חייב להכיל 10 ספרות"),
});

const GoogleOAuthProvider = ({ children }: { children: ReactNode }) => <>{children}</>;

const GoogleLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess: (response: any) => void;
  onError: () => void;
  useOneTap?: boolean;
}) => (
  <Button type="button" className="w-full max-w-xs" onClick={onError}>
    התחבר עם Google
  </Button>
);

export function AuthModal() {
  const { authOpen, closeAuth, setToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(loginForm);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const token = await authService.login(parsed.data.email, parsed.data.password);
      if (!token) throw new Error("לא התקבל טוקן מהשרת");
      setToken(token);
      const payload = authService.decode(token);
      toast.success("התחברת בהצלחה");
      closeAuth();
      if (authService.isAdmin(payload)) {
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(extractError(err, "התחברות נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 שודרג: Auto-Login מיד לאחר הרשמה!
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(regForm);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const token = await authService.register(parsed.data);
      if (!token) throw new Error("לא התקבל טוקן מהשרת");
      setToken(token);
      const payload = authService.decode(token);
      toast.success("נרשמת והתחברת בהצלחה!");
      closeAuth();
      if (authService.isAdmin(payload)) {
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(extractError(err, "הרשמה נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  // 🔹 חדש: טיפול בהצלחת התחברות דרך גוגל
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const token = await authService.googleLogin(credentialResponse.credential);
      setToken(token);
      const payload = authService.decode(token);
      toast.success("התחברת בהצלחה עם Google");
      closeAuth();
      if (authService.isAdmin(payload)) {
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(extractError(err, "התחברות באמצעות גוגל נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="314706987398-npml3p0mgbnq08bp09921gl2rqkgmd73.apps.googleusercontent.com">
      <Dialog open={authOpen} onOpenChange={(o) => !o && closeAuth()}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-gradient-gold font-display">
              ברוכים הבאים
            </DialogTitle>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">התחברות</TabsTrigger>
              <TabsTrigger value="register">הרשמה</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">אימייל</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">סיסמה</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  התחברות
                </Button>

                {/* 🔹 כפתור התחברות עם גוגל */}
                <div className="flex justify-center mt-4 border-t pt-4">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("שגיאה בתקשורת מול גוגל")}
                    useOneTap
                  />
                </div>

                <Link 
                    to="/forget-password" 
                    className="text-sm text-blue-600 hover:underline mt-2 block text-center"
                    onClick={closeAuth}>
                    שכחת סיסמה?
                </Link>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">שם מלא</Label>
                  <Input
                    id="reg-name"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">אימייל</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">טלפון (10 ספרות)</Label>
                  <Input
                    id="reg-phone"
                    value={regForm.phoneNumber}
                    onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })}
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">סיסמה</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  הרשמה והתחברות
                </Button>
                
                {/* 🔹 כפתור הרשמה עם גוגל */}
                <div className="flex justify-center mt-4 border-t pt-4">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("שגיאה בתקשורת מול גוגל")}
                  />
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </GoogleOAuthProvider>
  );
}