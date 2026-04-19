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

type PaymentStatus = "paid" | "partial" | "unpaid";
type PaymentMethod = "cash" | "card" | "bank";

interface Payment {
  id: number;
  code?: string | null;
  orderId: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string | null;
  order?: { id: number; code?: string | null };
}

interface OrderRef { id: number; code?: string | null; origin?: string | null; destination?: string | null }

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  unpaid: "bg-red-100 text-red-700",
};

const METHOD_STYLES: Record<PaymentMethod, string> = {
  cash: "bg-gray-100 text-gray-700",
  card: "bg-blue-100 text-blue-700",
  bank: "bg-purple-100 text-purple-700",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>{label}</span>;
}

type FormState = { code: string; orderId: string; amount: string; method: string; status: string; paidAt: string };
const EMPTY_FORM: FormState = { code: "", orderId: "", amount: "", method: "cash", status: "unpaid", paidAt: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orderRefs, setOrderRefs] = useState<OrderRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, os] = await Promise.all([api.list<Payment>("payments"), api.list<OrderRef>("orders")]);
      setPayments(ps);
      setOrderRefs(os);
    } catch {
      toast({ message: "Failed to load payments", variant: "error" });
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

  function openEdit(p: Payment) {
    setForm({ code: p.code ?? "", orderId: String(p.orderId), amount: p.amount, method: p.method, status: p.status, paidAt: p.paidAt ? p.paidAt.slice(0, 16) : "" });
    setErrors({});
    setEditing(p);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.orderId) e.orderId = "Order is required";
    if (!form.amount) e.amount = "Amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      order_id: Number(form.orderId),
      amount: form.amount,
      method: form.method,
      status: form.status,
      ...(form.code ? { code: form.code } : {}),
      ...(form.paidAt ? { paid_at: form.paidAt } : {}),
    };
    try {
      if (editing) {
        await api.update("payments", editing.id, body);
        toast({ message: "Payment updated", variant: "success" });
      } else {
        await api.create("payments", body);
        toast({ message: "Payment created", variant: "success" });
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
      await api.remove("payments", id);
      toast({ message: "Payment deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Payment" : "New Payment"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Order <span className="text-red-500">*</span></label>
              <select className={errors.orderId ? errInputCls : inputCls} value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}>
                <option value="">Select order…</option>
                {orderRefs.map((o) => <option key={o.id} value={o.id}>{o.code ? `(${o.code}) ` : `#${o.id} `}{o.origin} → {o.destination}</option>)}
              </select>
              {errors.orderId && <p className="text-xs text-red-600 mt-1">{errors.orderId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="PAY-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" className={errors.amount ? errInputCls : inputCls} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Method</label>
              <select className={inputCls} value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Paid At</label>
              <input type="datetime-local" className={inputCls} value={form.paidAt} onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Payment>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "order", label: "Order", render: (r) => r.order?.code ?? `#${r.orderId}` },
    { key: "amount", label: "Amount", align: "right", render: (r) => `$${Number(r.amount).toFixed(2)}` },
    { key: "method", label: "Method", render: (r) => <Badge label={r.method} cls={METHOD_STYLES[r.method] ?? "bg-gray-100 text-gray-600"} /> },
    { key: "status", label: "Status", render: (r) => <Badge label={r.status} cls={STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"} /> },
    { key: "paidAt", label: "Paid At", render: (r) => r.paidAt ? formatDate(r.paidAt) : "—" },
  ];

  return (
    <>
      <CrudLayout
        title="Payments"
        subtitle={`${payments.length} payment${payments.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Payment</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Payment</Button>}
          onEdit={openEdit}
          onDelete={(p) => setConfirmDelete({ id: p.id, label: p.code ? `Payment ${p.code}` : `Payment #${p.id}` })}
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
