"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { fetchNextCode } from "@/lib/generateCode";
import { SearchSelect } from "@/components/SearchSelect";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CPStatus = "pending" | "completed" | "refunded" | "failed";

interface CustomerPayment {
  id: number;
  code?: string | null;
  customerId: number;
  amount: string;
  method: string;
  status: CPStatus;
  paidAt?: string | null;
  notes?: string | null;
  customer?: { id: number; name: string; lastName?: string | null };
}

interface CustomerRef { id: number; name: string; lastName?: string | null }

const STATUS_STYLES: Record<CPStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  refunded: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: CPStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

type FormState = { code: string; customerId: string; invoiceId: string; amount: string; method: string; status: string; paidAt: string; notes: string };
const EMPTY_FORM: FormState = { code: "", customerId: "", invoiceId: "", amount: "", method: "cash", status: "pending", paidAt: "", notes: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [customers, setCustomers] = useState<CustomerRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<CustomerPayment | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ps, cs] = await Promise.all([api.list<CustomerPayment>("customer-payments"), api.list<CustomerRef>("customers")]);
      setPayments(ps);
      setCustomers(cs);
    } catch {
      toast({ message: "Failed to load customer payments", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("customer-payments", "CPAY");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(p: CustomerPayment) {
    setForm({
      code: p.code ?? "",
      customerId: String(p.customerId),
      invoiceId: "",
      amount: p.amount,
      method: p.method,
      status: p.status,
      paidAt: p.paidAt ? p.paidAt.slice(0, 16) : "",
      notes: p.notes ?? "",
    });
    setErrors({});
    setEditing(p);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerId) e.customerId = "Customer is required";
    if (!form.amount) e.amount = "Amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      customerId: Number(form.customerId),
      amount: form.amount,
      method: form.method,
      status: form.status,
      ...(form.code ? { code: form.code } : {}),
      ...(form.invoiceId ? { invoiceId: Number(form.invoiceId) } : {}),
      ...(form.paidAt ? { paidAt: form.paidAt } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };
    try {
      if (editing) {
        await api.update("customer-payments", editing.id, body);
        toast({ message: "Payment updated", variant: "success" });
      } else {
        await api.create("customer-payments", body);
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
      await api.remove("customer-payments", id);
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
        title={editing ? "Edit Customer Payment" : "New Customer Payment"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Customer <span className="text-red-500">*</span></label>
              <SearchSelect
                options={customers.map((c) => ({ value: c.id, label: `${c.name}${c.lastName ? " " + c.lastName : ""}` }))}
                value={form.customerId ? Number(form.customerId) : null}
                onChange={(v) => setForm((f) => ({ ...f, customerId: v != null ? String(v) : "" }))}
                placeholder="Select customer…"
                hasError={!!errors.customerId}
                clearable
              />
              {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="PAY-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Invoice ID (optional)</label>
              <input type="number" className={inputCls} value={form.invoiceId} onChange={(e) => setForm((f) => ({ ...f, invoiceId: e.target.value }))} />
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
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Paid At</label>
              <input type="datetime-local" className={inputCls} value={form.paidAt} onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
              <input type="text" className={inputCls} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<CustomerPayment>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "customer", label: "Customer", render: (r) => r.customer ? `${r.customer.name}${r.customer.lastName ? " " + r.customer.lastName : ""}` : String(r.customerId) },
    { key: "amount", label: "Amount", align: "right", render: (r) => `$${Number(r.amount).toFixed(2)}` },
    { key: "method", label: "Method", render: (r) => r.method },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "paidAt", label: "Paid At", render: (r) => r.paidAt ? formatDate(r.paidAt) : "—" },
  ];

  return (
    <>
      <CrudLayout
        title="Customer Payments"
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
          emptyMessage="No customer payments yet."
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
