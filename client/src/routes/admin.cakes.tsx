import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cakeService } from "@/services/cakeService";
import { categoryService } from "@/services/categoryService";
import type { Cake, Category } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";
import { CakeDetailsModal } from "@/components/cakes/CakeDetailsModal";

export const Route = createFileRoute("/admin/cakes")({
  component: AdminCakes,
});

const empty: Partial<Cake> = {
  name: "", description: "", price: 0, ingredients: "", imageUrl: "", isActive: true,
};

function AdminCakes() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Cake>>(empty);
  const [detailsCake, setDetailsCake] = useState<Cake | null>(null);
  const editing = !!form.id && cakes.some((c) => c.id === form.id);

  const refresh = async () => {
    setLoading(true);
    try {
      const [c, k] = await Promise.all([cakeService.getAll(), categoryService.getAll().catch(() => [])]);
      setCakes(c);
      setCats(k);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openEdit = (c: Cake) => {
    // Pre-populate ALL fields including ingredients & isActive
    setForm({
      id: c.id,
      name: c.name ?? "",
      description: c.description ?? "",
      price: c.price ?? 0,
      ingredients: c.ingredients ?? "",
      imageUrl: c.imageUrl ?? "",
      isActive: !!c.isActive,
      category: c.category ?? null,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing && form.id) {
        await cakeService.update(form.id, form);
        toast.success("עודכן");
      } else {
        await cakeService.add(form);
        toast.success("נוסף");
      }
      setOpen(false);
      setForm(empty);
      refresh();
    } catch (e) {
      toast.error(extractError(e, "שגיאה"));
    }
  };

  const toggleActive = async (c: Cake) => {
    try {
      const updated = await cakeService.update(c.id, { ...c, isActive: !c.isActive });
      setCakes((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: updated.isActive } : x)));
    } catch (e) {
      toast.error(extractError(e));
    }
  };

  const confirmDelete = async () => {
    if (!delId) return;
    try {
      await cakeService.remove(delId);
      toast.success("נמחק");
      setDelId(null);
      refresh();
    } catch (e) {
      toast.error(extractError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-espresso">ניהול עוגות</h1>
        <Button onClick={() => { setForm(empty); setOpen(true); }} className="bg-espresso">
          <Plus className="ml-2 h-4 w-4" /> עוגה חדשה
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תמונה</TableHead>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">קטגוריה</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">זמין</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">טוען...</TableCell></TableRow>
            ) : cakes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">אין עוגות</TableCell></TableRow>
            ) : cakes.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-secondary/40"
                onClick={() => setDetailsCake(c)}
              >
                <TableCell>
                  <img src={c.imageUrl} alt={c.name} className="h-12 w-12 rounded-md object-cover bg-muted" />
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.category?.name ?? "—"}</TableCell>
                <TableCell className="text-gold font-bold">₪{c.price}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch checked={!!c.isActive} onCheckedChange={() => toggleActive(c)} />
                    <span className="text-xs text-muted-foreground">
                      {c.isActive ? "זמין" : "לא זמין"}
                    </span>
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDelId(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "עריכת עוגה" : "עוגה חדשה"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>שם</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>מחיר</Label><Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
            <div className="space-y-2"><Label>מרכיבים</Label><Textarea value={form.ingredients ?? ""} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></div>
            <div className="space-y-2"><Label>קישור לתמונה</Label><Input value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select
                value={form.category?.categoryCode ? String(form.category.categoryCode) : ""}
                onValueChange={(v) => {
                  const cat = cats.find((c) => c.categoryCode === +v);
                  setForm({ ...form, category: cat ?? null });
                }}
              >
                <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.categoryCode} value={String(c.categoryCode)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>זמין למכירה</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} className="bg-espresso">שמירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {detailsCake && (
        <CakeDetailsModal
          cake={detailsCake}
          open={!!detailsCake}
          onOpenChange={(o) => !o && setDetailsCake(null)}
        />
      )}

      <AlertDialog open={delId !== null} onOpenChange={(o) => !o && setDelId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק עוגה?</AlertDialogTitle>
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
