"use client";
import { useCallback, useEffect, useState } from "react";
import { Printer, Plus, RefreshCw, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { InvoicePrintView } from "./InvoicePrintView";
import { ProductSelector } from "@/components/ProductSelector";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface LineItem {
  id?: number;
  productId?: number | null;
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
  amount?: string;
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

const EMPTY_LINE: LineItem = { productId: null, description: "", quantity: 1, unitPrice: 0, totalPrice: 0 };

type FormState = {
  code: string; customerId: string; orderId: string; dueDate: string;
  status: string; notes: string; taxPct: string;
};

const EMPTY_FORM: FormState = {
  code: "", customerId: "", orderId: "", dueDate: "",
  status: "draft", notes: "", taxPct: "0",
};

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

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
      taxPct: inv.tax ?? "0",
    });
    setItems(inv.items && inv.items.length > 0 ? inv.items.map((i) => ({ ...i })) : [{ ...EMPTY_LINE }]);
    setErrors({});
    setEditInvoice(inv);
    setView("form");
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number | null) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.totalPrice = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      return updated;
    }));
  }

  function selectProduct(idx: number, product: { id: number; name: string; price: string; unitMeasure?: string }) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const unitPrice = Number(product.price) || 0;
      return {
        ...item,
        productId: product.id,
        description: product.name,
        unitPrice,
        totalPrice: (Number(item.quantity) || 1) * unitPrice,
      };
    }));
  }

  function addItem() { setItems((prev) => [...prev, { ...EMPTY_LINE }]); }
  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);
  const taxPct = Number(form.taxPct) || 0;
  const taxAmount = (subtotal * taxPct) / 100;
  const total = subtotal + taxAmount;

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
        ...(i.productId ? { productId: i.productId } : {}),
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
      <PageForm
        title={editInvoice ? `Edit Invoice #${editInvoice.id}` : "New Invoice"}
        onBack={() => setView("list")}
        onSave={() => void handleSubmit()}
        onCancel={() => setView("list")}
        saving={saving}
        saveLabel={editInvoice ? "Save Changes" : "Create Invoice"}
      >
        {/* Invoice Details */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-base text-gray-800 border-b pb-2">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                className={errors.customerId ? errInputCls : inputCls}
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
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input
                type="text" placeholder="INV-001 (auto-generated if blank)"
                className={inputCls}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Due Date</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Order ID (optional)</label>
              <input
                type="number" placeholder="Order #"
                className={inputCls}
                value={form.orderId}
                onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-base text-gray-800">Line Items</h2>
            <Button variant="outline" size="sm" onClick={addItem}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 px-2 font-medium w-[22%]">Product</th>
                  <th className="text-left py-2 px-2 font-medium w-[30%]">Description</th>
                  <th className="text-right py-2 px-2 font-medium w-[12%]">Qty</th>
                  <th className="text-right py-2 px-2 font-medium w-[16%]">Unit Price</th>
                  <th className="text-right py-2 px-2 font-medium w-[14%]">Total</th>
                  <th className="w-[6%]" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2">
                      <ProductSelector
                        value={item.productId ?? null}
                        onChange={(p) => selectProduct(idx, p)}
                        placeholder="Select…"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text" placeholder="Description…"
                        className={`w-full rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_desc`] ? "border-red-500" : "border-input"}`}
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                      />
                      {errors[`item_${idx}_desc`] && <p className="text-xs text-red-600 mt-0.5">{errors[`item_${idx}_desc`]}</p>}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={1}
                        className={`w-full rounded border px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_qty`] ? "border-red-500" : "border-input"}`}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={0} step="0.01"
                        className={`w-full rounded border px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_price`] ? "border-red-500" : "border-input"}`}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-700">
                      ${Number(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button" title="Remove row"
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
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
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax (%)</span>
                <input
                  type="number" min={0} max={100} step="0.1"
                  className="w-24 rounded border border-input px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  value={form.taxPct}
                  onChange={(e) => setForm((f) => ({ ...f, taxPct: e.target.value }))}
                />
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax amount</span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-base text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-base text-gray-800 border-b pb-2">Notes</h2>
          <textarea
            rows={3}
            placeholder="Optional notes for this invoice…"
            className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </PageForm>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────────────────────────────
  const columns: TableColumn<Invoice>[] = [
    { key: "id", label: "#", width: "60px", render: (r) => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "customer", label: "Customer", render: (r) => r.customer ? customerName(r.customer.id) : String(r.customerId) },
    { key: "subtotal", label: "Subtotal", align: "right", render: (r) => `$${Number(r.subtotal).toFixed(2)}` },
    { key: "tax", label: "Tax", align: "right", render: (r) => `$${Number(r.tax).toFixed(2)}` },
    { key: "total", label: "Total", align: "right", render: (r) => <span className="font-semibold">${Number(r.total).toFixed(2)}</span> },
    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <CrudLayout
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" /> New Invoice
            </Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={invoices}
          loading={loading}
          emptyMessage="No invoices yet"
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Invoice</Button>}
          onEdit={openEdit}
          onDelete={(inv) => setConfirmDelete({ id: inv.id, label: inv.code ? `Invoice ${inv.code}` : `Invoice #${inv.id}` })}
          actions={(inv) => (
            <Button variant="outline" size="sm" onClick={() => setPrintInvoice(inv)} title="Print">
              <Printer className="h-4 w-4" />
            </Button>
          )}
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

      {printInvoice && (
        <InvoicePrintView invoice={{ ...printInvoice, amount: printInvoice.total }} onClose={() => setPrintInvoice(null)} />
      )}
    </>
  );
}
