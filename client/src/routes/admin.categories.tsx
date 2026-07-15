import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types";
import { extractError } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Category>>({ name: "" });

  const refresh = () => categoryService.getAll().then(setCats).catch((e) => toast.error(extractError(e)));
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    try {
      if (form.categoryCode) await categoryService.update(form.categoryCode, form);
      else await categoryService.add(form);
      toast.success("נשמר");
      setOpen(false); setForm({ name: "" }); refresh();
    } catch (e) { toast.error(extractError(e)); }
  };

  const remove = async (id: number) => {
    try { await categoryService.remove(id); toast.success("נמחק"); refresh(); }
    catch (e) { toast.error(extractError(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-espresso">קטגוריות</h1>
        <Button onClick={() => { setForm({ name: "" }); setOpen(true); }} className="bg-espresso text-sm px-3 sm:px-4">
          <Plus className="ml-1 sm:ml-2 h-4 w-4" /> חדש
        </Button>
      </div>
      {/* גריד שמותאם למובייל - עמודה אחת קבועה, ושתיים במסכים רחבים יותר */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cats.map((c) => (
          <Card key={c.categoryCode} className="p-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
            {/* truncate מוודא שטקסט ארוך לא שובר את השורה ודוחף את הכפתורים החוצה */}
            <span className="font-medium truncate flex-1">{c.name}</span>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => { setForm(c); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => remove(c.categoryCode)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="w-[95vw] sm:max-w-md">
          <DialogHeader><DialogTitle>{form.categoryCode ? "עריכת" : "חדש"} קטגוריה</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={save} className="bg-espresso w-full sm:w-auto">שמירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}