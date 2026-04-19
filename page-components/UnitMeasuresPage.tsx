"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnitMeasure {
  id: number;
  code?: string | null;
  name: string;
  symbol?: string | null;
  baseUnitId?: number | null;
  factor?: string | number | null;
}

type FormState = { code: string; name: string; symbol: string; baseUnitId: string; factor: string };
const EMPTY_FORM: FormState = { code: "", name: "", symbol: "", baseUnitId: "", factor: "" };

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function UnitMeasuresPage() {
  const [units, setUnits] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<UnitMeasure | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUnits(await api.list<UnitMeasure>("unit-measures"));
    } catch {
      toast({ message: "Failed to load unit measures", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(u: UnitMeasure) {
    setForm({
      code: u.code ?? "",
      name: u.name,
      symbol: u.symbol ?? "",
      baseUnitId: u.baseUnitId != null ? String(u.baseUnitId) : "",
      factor: u.factor != null ? String(u.factor) : "",
    });
    setErrors({});
    setEditing(u);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.baseUnitId && (!form.factor || Number(form.factor) <= 0)) e.factor = "Factor required when base unit is set";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      name: form.name,
      ...(form.code ? { code: form.code } : {}),
      ...(form.symbol ? { symbol: form.symbol } : {}),
      ...(form.baseUnitId ? { base_unit_id: parseInt(form.baseUnitId, 10) } : {}),
      ...(form.factor ? { factor: parseFloat(form.factor) } : {}),
    };
    try {
      if (editing) {
        await api.update("unit-measures", editing.id, body);
        toast({ message: "Unit measure updated", variant: "success" });
      } else {
        await api.create("unit-measures", body);
        toast({ message: "Unit measure created", variant: "success" });
      }
      setView("list");
      void load();
    } catch {
      toast({ message: editing ? "Update failed" : "Create failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("unit-measures", id);
      toast({ message: "Unit measure deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  const baseUnitName = (id: number | null | undefined) => {
    if (!id) return "—";
    const u = units.find((u) => u.id === id);
    return u ? u.name : String(id);
  };

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Unit Measure" : "New Unit Measure"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="00001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" className={errors.name ? errInputCls : inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Symbol</label>
              <input type="text" className={inputCls} value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Base Unit (optional)</label>
              <select className={inputCls} value={form.baseUnitId} onChange={(e) => setForm((f) => ({ ...f, baseUnitId: e.target.value }))}>
                <option value="">— None (this is a base unit) —</option>
                {units.filter((u) => !editing || u.id !== editing.id).map((u) => (
                  <option key={u.id} value={u.id}>{u.code ? `${u.code} - ` : ""}{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Factor {form.baseUnitId ? <span className="text-red-500">*</span> : null}</label>
              <input type="number" step="0.0001" min="0" placeholder="e.g. 1000" className={errors.factor ? errInputCls : inputCls} value={form.factor} onChange={(e) => setForm((f) => ({ ...f, factor: e.target.value }))} />
              {errors.factor && <p className="text-xs text-red-600 mt-1">{errors.factor}</p>}
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<UnitMeasure>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "name", label: "Name" },
    { key: "symbol", label: "Symbol", render: (r) => r.symbol ?? "—" },
    { key: "baseUnitId", label: "Base Unit", render: (r) => baseUnitName(r.baseUnitId) },
    { key: "factor", label: "Factor", render: (r) => r.factor != null ? String(r.factor) : "—" },
  ];

  return (
    <>
      <CrudLayout
        title="Unit Measures"
        subtitle={`${units.length} unit${units.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Unit</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={units}
          loading={loading}
          emptyMessage="No unit measures yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Unit</Button>}
          onEdit={openEdit}
          onDelete={(u) => setConfirmDelete({ id: u.id, label: u.name })}
        />
      </CrudLayout>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && void handleDelete(confirmDelete.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
