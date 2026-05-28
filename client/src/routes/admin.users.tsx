import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { userService } from "@/services/userService";
import type { User } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [delId, setDelId] = useState<number | null>(null);

  const refresh = () =>
    userService.getAllClients().then(setUsers).catch((e) => toast.error(extractError(e)));
  useEffect(() => { refresh(); }, []);

  const confirmDelete = async () => {
    if (!delId) return;
    try { await userService.remove(delId); toast.success("נמחק"); setDelId(null); refresh(); }
    catch (e) { toast.error(extractError(e)); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-espresso">ניהול משתמשים</h1>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">קוד</TableHead>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">תפקיד</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">אין משתמשים</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.code}>
                <TableCell>{u.code}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.phoneNumber}</TableCell>
                <TableCell>{u.role ?? "USER"}</TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDelId(u.code)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <AlertDialog open={delId !== null} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק משתמש?</AlertDialogTitle>
            <AlertDialogDescription>הפעולה אינה הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">מחיקה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
