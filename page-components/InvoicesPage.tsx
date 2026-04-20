"use client";
import { useCallback, useEffect, useState } from "react";
import { Printer, Plus, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { fetchNextCode } from "@/lib/generateCode";
import { SearchSelect } from "@/components/SearchSelect";
import { InvoicePrintView } from "./InvoicePrintView";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface InvoiceItem {
  productId: string;
  quantity: string;
  unitPrice: string;
  unitMeasureId: string;
}

interface Invoice {
  id: number;
  code?: string | null;
  customerId: number;
  orderId?: number | null;
  subtotal: string;
  total: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  customer?: { id: number; name: string; lastName?: string | null; email?: string | null; phone?: string | null };
  order?: { id: number; code?: string | null } | null;
  items?: Array<{ id?: number; productId?: number | null; description?: string | null; quantity: number; unitPrice: string; totalPrice: string; unitMeasureId?: number | null; product?: { id: number; name: string } | null; unitMeasure?: { id: number; name: string } | null }>;
}

interface Customer { id: number; name: string; lastName?: string | null }
interface Product { id: number; name: string; code?: string | null; price?: string; unitMeasureId?: number | null }
interface UnitMeasure { id: number; name: string; code?: string | null }
interface Order { id: number; code?: string | null }

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

type FormState = { code: string; customerId: string; orderId: string; dueDate: string; status: string; notes: string };
const EMPTY_FORM: FormState = { code: "", customerId: "", orderId: "", dueDate: "", status: "draft", notes: "" };
const EMPTY_ITEM: InvoiceItem = { productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, cust, prods, units, ords] = await Promise.all([
        api.list<Invoice>("invoices"),
        api.list<Customer>("customers"),
        api.list<Product>("products"),
        api.list<UnitMeasure>("unit-measures"),
        api.list<Order>("orders"),
      ]);
      setInvoices(inv);
      setCustomers(cust);
      setProducts(prods);
      setUnitMeasures(units);
      setOrders(ords);
    } catch {
      toast({ message: "Failed to load invoices", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("invoices", "INV");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setItems([{ ...EMPTY_ITEM }]);
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
    });
    const mappedItems: InvoiceItem[] = inv.items && inv.items.length > 0
      ? inv.items.map((i) => ({
          productId: i.productId ? String(i.productId) : "",
          quantity: String(i.quantity),
          unitPrice: String(Number(i.unitPrice)),
          unitMeasureId: i.unitMeasureId ? String(i.unitMeasureId) : "",
        }))
      : [{ ...EMPTY_ITEM }];
    setItems(mappedItems);
    setErrors({});
    setEditInvoice(inv);
    setView("form");
  }

  function updateItem(idx: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      if (patch.productId !== undefined) {
        const p = products.find((p) => String(p.id) === patch.productId);
        if (p) {
          if (!updated.unitPrice) updated.unitPrice = p.price ?? "";
          if (p.unitMeasureId && !updated.unitMeasureId) updated.unitMeasureId = String(p.unitMeasureId);
        }
      }
      return updated;
    }));
  }

  const totalAmount = items.reduce((sum, i) => {
    const qty = Number(i.quantity); const price = Number(i.unitPrice);
    return sum + (Number.isFinite(qty) && Number.isFinite(price) ? qty * price : 0);
  }, 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerId) e.customerId = "Customer is required";
    const validItems = items.filter((i) => i.productId);
    if (validItems.length === 0) e.items = "Add at least one item";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    const itemPayload = items
      .filter((i) => i.productId)
      .map((i) => ({
        ...(i.productId ? { productId: Number(i.productId) } : {}),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice) || 0,
        ...(i.unitMeasureId ? { unitMeasureId: Number(i.unitMeasureId) } : {}),
      }));
    const body: Record<string, unknown> = {
      ...(form.code ? { code: form.code } : {}),
      customerId: Number(form.customerId),
      ...(form.orderId ? { orderId: Number(form.orderId) } : { orderId: null }),
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      status: form.status,
      ...(form.notes ? { notes: form.notes } : {}),
      items: itemPayload,
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
        saveLabel={editInvoice ? "Save Changes" : "Save Invoice"}
      >
        {/* Invoice Header */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-base text-gray-800 border-b pb-2 uppercase tracking-wide text-xs text-gray-500">Invoice Header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input
                type="text" placeholder="INV-001"
                className={inputCls}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Customer <span className="text-red-500">*</span></label>
              <SearchSelect
                options={customers.map((c) => ({ value: c.id, label: `${c.name}${c.lastName ? " " + c.lastName : ""}` }))}
                value={form.customerId ? Number(form.customerId) : null}
                onChange={(v) => setForm((f) => ({ ...f, customerId: v != null ? String(v) : "" }))}
                placeholder="Select customer…"
                hasError={!!errors.customerId}
                clearable
                quickCreate={{
                  label: "Add New Customer",
                  fields: [
                    { key: "name", label: "First Name", required: true },
                    { key: "lastName", label: "Last Name" },
                    { key: "email", label: "Email", type: "email" },
                    { key: "phone", label: "Phone", type: "tel" },
                  ],
                  onSave: async (data) => {
                    const res = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                    const created = await res.json();
                    setCustomers((prev) => [...prev, created]);
                    return { id: created.id, name: `${created.name}${created.lastName ? " " + created.lastName : ""}` };
                  },
                }}
              />
              {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Due Date</label>
              <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Linked Order (optional)</label>
              <SearchSelect
                options={orders.map((o) => ({ value: o.id, label: o.code ? `Order ${o.code}` : `Order #${o.id}` }))}
                value={form.orderId ? Number(form.orderId) : null}
                onChange={(v) => setForm((f) => ({ ...f, orderId: v != null ? String(v) : "" }))}
                placeholder="None"
                clearable
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-base text-gray-800">Line Items</h2>
            <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-2 px-2 font-medium w-6">#</th>
                  <th className="text-left py-2 px-2 font-medium w-[30%]">Product</th>
                  <th className="text-right py-2 px-2 font-medium w-20">Qty</th>
                  <th className="text-right py-2 px-2 font-medium w-32">Unit Price</th>
                  <th className="text-left py-2 px-2 font-medium w-[20%]">Unit</th>
                  <th className="text-right py-2 px-2 font-medium w-28">Line Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  return (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50">
                      <td className="py-2 px-2 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <SearchSelect
                          options={products.map((p) => ({ value: p.id, label: p.name, sublabel: p.code ?? undefined }))}
                          value={item.productId ? Number(item.productId) : null}
                          onChange={(v) => updateItem(idx, { productId: v != null ? String(v) : "" })}
                          placeholder="Select…"
                          clearable
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number" min={1}
                          className="w-full rounded border border-input px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number" min={0} step="0.01"
                          className="w-full rounded border border-input px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <SearchSelect
                          options={unitMeasures.map((u) => ({ value: u.id, label: u.name, sublabel: u.code ?? undefined }))}
                          value={item.unitMeasureId ? Number(item.unitMeasureId) : null}
                          onChange={(v) => updateItem(idx, { unitMeasureId: v != null ? String(v) : "" })}
                          placeholder="—"
                          clearable
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-gray-700 whitespace-nowrap">
                        ${lineTotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => items.length > 1 && setItems((p) => p.filter((_, i) => i !== idx))}
                          disabled={items.length <= 1}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors text-base leading-none"
                        >✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <div className="flex items-center gap-4 text-sm font-semibold text-gray-900">
              <span className="text-gray-500 font-normal">Total</span>
              <span className="text-lg">${totalAmount.toFixed(2)}</span>
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
    { key: "customer", label: "Customer", render: (r) => r.customer ? `${r.customer.name}${r.customer.lastName ? " " + r.customer.lastName : ""}` : String(r.customerId) },
    { key: "total", label: "Total", align: "right", render: (r) => <span className="font-semibold">${Number(r.total).toFixed(2)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
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
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Invoice</Button>
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
