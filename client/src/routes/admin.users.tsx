import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userService } from "@/services/userService";
import type { User } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, Hash } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userService.getAllClients()
      .then(setUsers)
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-espresso">ניהול לקוחות</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">טוען...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border">אין משתמשים רשומים</div>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-20">קוד</TableHead>
                  <TableHead className="text-right">שם לקוח</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.code} className="hover:bg-secondary/40 transition-colors">
                    <TableCell className="text-muted-foreground font-mono">#{u.code}</TableCell>
                    <TableCell className="font-bold text-espresso">{u.name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phoneNumber || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* מובייל */}
          <div className="md:hidden flex flex-col gap-3 w-full">
            {users.map((u) => (
              <Card key={u.code} className="p-3.5 flex flex-col gap-2 border border-border/50 shadow-sm w-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-1 w-full">
                  <h3 className="font-bold text-sm text-espresso truncate flex-1">{u.name || "משתמש ללא שם"}</h3>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md text-muted-foreground flex items-center gap-1 shrink-0 ml-1">
                    <Hash className="h-2.5 w-2.5" /> {u.code}
                  </span>
                </div>
                
                <div className="space-y-2 mt-0.5 w-full">
                  <div className="flex items-center gap-2.5 text-xs w-full overflow-hidden">
                    <div className="bg-gold/10 p-1.5 rounded-md text-gold shrink-0"><Mail className="h-3.5 w-3.5" /></div>
                    <span className="truncate w-full block text-left" dir="ltr">{u.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-xs w-full">
                    <div className="bg-gold/10 p-1.5 rounded-md text-gold shrink-0"><Phone className="h-3.5 w-3.5" /></div>
                    <span dir="ltr" className="text-right flex-1">{u.phoneNumber || "לא צוין מס' טלפון"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}