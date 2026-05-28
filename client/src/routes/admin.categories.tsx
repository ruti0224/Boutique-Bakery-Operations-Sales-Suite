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
        <h1 className="font-display text-3xl font-bold text-espresso">קטגוריות</h1>
        <Button onClick={() => { setForm({ name: "" }); setOpen(true); }} className="bg-espresso">
          <Plus className="ml-2 h-4 w-4" /> חדש
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((c) => (
          <Card key={c.categoryCode} className="p-4 flex items-center justify-between">
            <span className="font-medium">{c.name}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setForm(c); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c.categoryCode)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{form.categoryCode ? "עריכת" : "חדש"} קטגוריה</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <DialogFooter><Button onClick={save} className="bg-espresso">שמירה</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
