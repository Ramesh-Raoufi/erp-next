"use client";
import { useCallback, useEffect, useState } from "react";
import { Printer, Plus, Pencil, Trash2, RefreshCw, ArrowLeft, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { InvoicePrintView } from "./InvoicePrintView";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: number;
  code?: string | null;
  customerId: number;
  orderId?: number | null;
  subtotal: string;
  tax: string;
  total: string;
  amount?: string; // kept for print view compatibility
  dueDate?: string | null;
  status: InvoiceStatus;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  customer?: { id: number; name: string; lastName?: string | null; email?: string | null; phone?: string | null };
  order?: { id: number; code?: string | null } | null;
  items?: LineItem[];
}

interface Customer { id: number; name: string; lastName?: string | null }

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-rose-200 text-rose-900",
};

const STATUS_OPTIONS: { label: string; value: InvoiceStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_LINE: LineItem = { description: "", quantity: 1, unitPrice: 0, totalPrice: 0 };

type FormState = {
  code: string; customerId: string; orderId: string; dueDate: string;
  status: string; notes: string; tax: string;
};

const EMPTY_FORM: FormState = {
  code: "", customerId: "", orderId: "", dueDate: "",
  status: "draft", notes: "", tax: "0",
};

// ─── Skeleton rows ────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-t animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-muted rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, cust] = await Promise.all([
        api.list<Invoice>("invoices"),
        api.list<Customer>("customers"),
      ]);
      setInvoices(inv);
      setCustomers(cust);
    } catch {
      toast({ message: "Failed to load invoices", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setItems([{ ...EMPTY_LINE }]);
    setErrors({});
    setEditInvoice(null);
    setView("form");
  }

  function openEdit(inv: Invoice) {
    setForm({
      code: inv.code ?? "",
      customerId: String(inv.customerId),
      orderId: inv.orderId ? String(inv.orderId) : "",
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 16) : "",
      status: inv.status,
      notes: inv.notes ?? "",
      tax: inv.tax ?? "0",
    });
    setItems(inv.items && inv.items.length > 0 ? inv.items.map((i) => ({ ...i })) : [{ ...EMPTY_LINE }]);
    setErrors({});
    setEditInvoice(inv);
    setView("form");
  }

  // ─── Line item helpers ────────────────────────────────────────
  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems((prev) => {
      const next = prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        updated.totalPrice = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        return updated;
      });
      return next;
    });
  }

  function addItem() { setItems((prev) => [...prev, { ...EMPTY_LINE }]); }
  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  const subtotal = items.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);
  const taxAmount = Number(form.tax) || 0;
  const total = subtotal + taxAmount;

  // ─── Validation ───────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerId) e.customerId = "Customer is required";
    items.forEach((item, idx) => {
      if (!item.description) e[`item_${idx}_desc`] = "Description required";
      if (Number(item.quantity) <= 0) e[`item_${idx}_qty`] = "Qty must be > 0";
      if (Number(item.unitPrice) < 0) e[`item_${idx}_price`] = "Price must be ≥ 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    const body = {
      ...(form.code ? { code: form.code } : {}),
      customerId: Number(form.customerId),
      ...(form.orderId ? { orderId: Number(form.orderId) } : { orderId: null }),
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      status: form.status,
      ...(form.notes ? { notes: form.notes } : {}),
      tax: taxAmount,
      items: items.filter((i) => i.description).map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };
    try {
      if (editInvoice) {
        await api.update("invoices", editInvoice.id, body);
        toast({ message: "Invoice updated", variant: "success" });
      } else {
        await api.create("invoices", body);
        toast({ message: "Invoice created", variant: "success" });
      }
      setView("list");
      void load();
    } catch {
      toast({ message: editInvoice ? "Update failed" : "Create failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("invoices", id);
      toast({ message: "Invoice deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  const customerName = (id: number) => {
    const c = customers.find((c) => c.id === id);
    return c ? `${c.name}${c.lastName ? " " + c.lastName : ""}` : String(id);
  };

  // ──────────────────────────────────────────────────────────────
  // FORM VIEW
  // ──────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editInvoice ? `Edit Invoice #${editInvoice.id}` : "New Invoice"}</h1>
            <p className="text-sm text-muted-foreground">{editInvoice ? "Update invoice details" : "Create a new customer invoice"}</p>
          </div>
        </div>

        {/* Section: Customer Info */}
        <div className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold text-base border-b pb-2">Customer Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer <span className="text-red-500">*</span></label>
              <select
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.customerId ? "border-red-500" : "border-input"}`}
                value={form.customerId}
                onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.lastName ? ` ${c.lastName}` : ""}</option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text" placeholder="INV-001"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
              <input
                type="number" placeholder="Order #"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.orderId}
                onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input
                type="text"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Section: Line Items */}
        <div className="rounded-lg border p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-base">Line Items</h2>
            <Button variant="outline" size="sm" onClick={addItem}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium w-[40%]">Description</th>
                  <th className="text-right py-2 px-2 font-medium w-[15%]">Qty</th>
                  <th className="text-right py-2 px-2 font-medium w-[20%]">Unit Price</th>
                  <th className="text-right py-2 px-2 font-medium w-[20%]">Total</th>
                  <th className="w-[5%]" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2">
                      <input
                        type="text" placeholder="Description…"
                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_desc`] ? "border-red-500" : "border-input"}`}
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                      />
                      {errors[`item_${idx}_desc`] && <p className="text-xs text-red-600 mt-0.5">{errors[`item_${idx}_desc`]}</p>}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={1}
                        className={`w-full rounded border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_qty`] ? "border-red-500" : "border-input"}`}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={0} step="0.01"
                        className={`w-full rounded border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_price`] ? "border-red-500" : "border-input"}`}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {Number(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="py-2 px-2">
                      <button
                        type="button" title="Remove"
                        onClick={() => removeItem(idx)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax</span>
                <input
                  type="number" min={0} step="0.01"
                  className="w-24 rounded border border-input px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.tax}
                  onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
                />
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => setView("list")} disabled={saving}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : (editInvoice ? "Save Changes" : "Create Invoice")}
          </Button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Showing {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Invoice
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-right font-medium">Subtotal</th>
              <th className="px-4 py-3 text-right font-medium">Tax</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Due Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">No invoices yet</p>
                    <p className="text-sm">Create your first invoice to get started.</p>
                    <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Invoice</Button>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.id}</td>
                  <td className="px-4 py-3">{inv.code ?? "—"}</td>
                  <td className="px-4 py-3">
                    {inv.customer ? customerName(inv.customer.id) : inv.customerId}
                  </td>
                  <td className="px-4 py-3 text-right">{Number(inv.subtotal).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{Number(inv.tax).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(inv.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setPrintInvoice(inv)} title="Print">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(inv)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200"
                        onClick={() => setConfirmDelete({ id: inv.id, label: inv.code ? `Invoice ${inv.code}` : `Invoice #${inv.id}` })}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && void handleDelete(confirmDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {printInvoice && (
        <InvoicePrintView invoice={{ ...printInvoice, amount: printInvoice.total }} onClose={() => setPrintInvoice(null)} />
      )}
    </div>
  );
}
