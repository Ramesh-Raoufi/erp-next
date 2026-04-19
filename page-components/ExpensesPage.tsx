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

type ExpenseType = "shipment" | "general";
type ExpenseCategory = "fuel" | "rent" | "salary" | "maintenance" | "office";

interface Expense {
  id: number;
  code?: string | null;
  type: ExpenseType;
  category: ExpenseCategory;
  amount: string;
  description?: string | null;
  paidAt?: string | null;
  referenceId?: number | null;
  createdAt: string;
}

interface TransferRef { id: number; code?: string | null; status?: string | null }

const TYPE_STYLES: Record<ExpenseType, string> = {
  shipment: "bg-blue-100 text-blue-700",
  general: "bg-gray-100 text-gray-600",
};

const CAT_STYLES: Record<ExpenseCategory, string> = {
  fuel: "bg-orange-100 text-orange-700",
  rent: "bg-purple-100 text-purple-700",
  salary: "bg-green-100 text-green-700",
  maintenance: "bg-yellow-100 text-yellow-700",
  office: "bg-gray-100 text-gray-600",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>{label}</span>;
}

type FormState = { code: string; type: string; category: string; amount: string; description: string; paidAt: string; referenceId: string };
const EMPTY_FORM: FormState = { code: "", type: "general", category: "office", amount: "", description: "", paidAt: "", referenceId: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transfers, setTransfers] = useState<TransferRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [es, ts] = await Promise.all([api.list<Expense>("expenses"), api.list<TransferRef>("transfers")]);
      setExpenses(es);
      setTransfers(ts);
    } catch {
      toast({ message: "Failed to load expenses", variant: "error" });
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

  function openEdit(e: Expense) {
    setForm({
      code: e.code ?? "",
      type: e.type,
      category: e.category,
      amount: e.amount,
      description: e.description ?? "",
      paidAt: e.paidAt ? e.paidAt.slice(0, 16) : "",
      referenceId: e.referenceId != null ? String(e.referenceId) : "",
    });
    setErrors({});
    setEditing(e);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.amount) e.amount = "Amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      type: form.type,
      category: form.category,
      amount: form.amount,
      ...(form.code ? { code: form.code } : {}),
      ...(form.description ? { description: form.description } : {}),
      ...(form.paidAt ? { paid_at: form.paidAt } : {}),
      ...(form.referenceId ? { reference_id: Number(form.referenceId) } : {}),
    };
    try {
      if (editing) {
        await api.update("expenses", editing.id, body);
        toast({ message: "Expense updated", variant: "success" });
      } else {
        await api.create("expenses", body);
        toast({ message: "Expense created", variant: "success" });
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
      await api.remove("expenses", id);
      toast({ message: "Expense deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Expense" : "New Expense"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="EXP-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="general">General</option>
                <option value="shipment">Shipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option value="fuel">Fuel</option>
                <option value="rent">Rent</option>
                <option value="salary">Salary</option>
                <option value="maintenance">Maintenance</option>
                <option value="office">Office</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" className={errors.amount ? errInputCls : inputCls} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
            {form.type === "shipment" && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Transfer (optional)</label>
                <select className={inputCls} value={form.referenceId} onChange={(e) => setForm((f) => ({ ...f, referenceId: e.target.value }))}>
                  <option value="">— None —</option>
                  {transfers.map((t) => <option key={t.id} value={t.id}>{t.code ? `(${t.code}) ` : `#${t.id} `}{t.status}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Paid At</label>
              <input type="datetime-local" className={inputCls} value={form.paidAt} onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Expense>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "type", label: "Type", render: (r) => <Badge label={r.type} cls={TYPE_STYLES[r.type] ?? "bg-gray-100 text-gray-600"} /> },
    { key: "category", label: "Category", render: (r) => <Badge label={r.category} cls={CAT_STYLES[r.category] ?? "bg-gray-100 text-gray-600"} /> },
    { key: "amount", label: "Amount", align: "right", render: (r) => `$${Number(r.amount).toFixed(2)}` },
    { key: "description", label: "Description", render: (r) => r.description ?? "—" },
    { key: "paidAt", label: "Paid At", render: (r) => r.paidAt ? formatDate(r.paidAt) : "—" },
  ];

  return (
    <>
      <CrudLayout
        title="Expenses"
        subtitle={`${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Expense</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={expenses}
          loading={loading}
          emptyMessage="No expenses yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Expense</Button>}
          onEdit={openEdit}
          onDelete={(e) => setConfirmDelete({ id: e.id, label: e.code ? `Expense ${e.code}` : `Expense #${e.id}` })}
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
