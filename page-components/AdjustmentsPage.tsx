"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { fetchNextCode } from "@/lib/generateCode";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Adjustment {
  id: number;
  code?: string | null;
  relatedType: string;
  relatedId: number;
  amount: string;
  reason?: string | null;
  createdAt: string;
}

type FormState = { code: string; relatedType: string; relatedId: string; amount: string; reason: string };
const EMPTY_FORM: FormState = { code: "", relatedType: "order", relatedId: "", amount: "", reason: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Adjustment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAdjustments(await api.list<Adjustment>("adjustments"));
    } catch {
      toast({ message: "Failed to load adjustments", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("adjustments", "ADJ");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(a: Adjustment) {
    setForm({ code: a.code ?? "", relatedType: a.relatedType, relatedId: String(a.relatedId), amount: a.amount, reason: a.reason ?? "" });
    setErrors({});
    setEditing(a);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.relatedId) e.relatedId = "Related ID is required";
    if (!form.amount) e.amount = "Amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      related_type: form.relatedType,
      related_id: Number(form.relatedId),
      amount: form.amount,
      ...(form.code ? { code: form.code } : {}),
      ...(form.reason ? { reason: form.reason } : {}),
    };
    try {
      if (editing) {
        await api.update("adjustments", editing.id, body);
        toast({ message: "Adjustment updated", variant: "success" });
      } else {
        await api.create("adjustments", body);
        toast({ message: "Adjustment created", variant: "success" });
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
      await api.remove("adjustments", id);
      toast({ message: "Adjustment deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Adjustment" : "New Adjustment"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="ADJ-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Related Type</label>
              <select className={inputCls} value={form.relatedType} onChange={(e) => setForm((f) => ({ ...f, relatedType: e.target.value }))}>
                <option value="order">Order</option>
                <option value="payment">Payment</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Related ID <span className="text-red-500">*</span></label>
              <input type="number" min="1" className={errors.relatedId ? errInputCls : inputCls} value={form.relatedId} onChange={(e) => setForm((f) => ({ ...f, relatedId: e.target.value }))} />
              {errors.relatedId && <p className="text-xs text-red-600 mt-1">{errors.relatedId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount (+/-) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" className={errors.amount ? errInputCls : inputCls} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Reason</label>
              <input type="text" className={inputCls} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Adjustment>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "relatedType", label: "Related Type" },
    { key: "relatedId", label: "Related ID" },
    { key: "amount", label: "Amount", align: "right", render: (r) => `$${Number(r.amount).toFixed(2)}` },
    { key: "reason", label: "Reason", render: (r) => r.reason ?? "—" },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Adjustments"
        subtitle={`${adjustments.length} adjustment${adjustments.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Adjustment</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={adjustments}
          loading={loading}
          emptyMessage="No adjustments yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Adjustment</Button>}
          onEdit={openEdit}
          onDelete={(a) => setConfirmDelete({ id: a.id, label: a.code ? `Adjustment ${a.code}` : `Adjustment #${a.id}` })}
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
