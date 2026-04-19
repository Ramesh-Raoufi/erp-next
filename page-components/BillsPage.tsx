"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, PlusCircle } from "lucide-react";
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

type BillStatus = "draft" | "pending" | "paid" | "overdue";

interface BillItem {
  productId: string;
  quantity: string;
  unitPrice: string;
  unitMeasureId: string;
}

interface Bill {
  id: number;
  code?: string | null;
  vendorId: number;
  subtotal: string;
  total: string;
  dueDate?: string | null;
  status: BillStatus;
  description?: string | null;
  paidAt?: string | null;
  createdAt: string;
  vendor?: { id: number; name: string };
  items?: Array<{ id?: number; productId?: number | null; quantity: number; unitPrice: string; totalPrice: string; unitMeasureId?: number | null; product?: { id: number; name: string } | null; unitMeasure?: { id: number; name: string } | null }>;
}

interface Vendor { id: number; name: string }
interface Product { id: number; name: string; code?: string | null; price?: string; unitMeasureId?: number | null }
interface UnitMeasure { id: number; name: string; code?: string | null }

const STATUS_STYLES: Record<BillStatus, string> = {
  draft:   "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-700",
  paid:    "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: { label: string; value: BillStatus }[] = [
  { label: "Draft",   value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Paid",    value: "paid" },
  { label: "Overdue", value: "overdue" },
];

function StatusBadge({ status }: { status: BillStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

type FormState = { code: string; vendorId: string; dueDate: string; status: string; description: string };
const EMPTY_FORM: FormState = { code: "", vendorId: "", dueDate: "", status: "draft", description: "" };
const EMPTY_ITEM: BillItem = { productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<BillItem[]>([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, v, p, u] = await Promise.all([
        api.list<Bill>("bills"),
        api.list<Vendor>("vendors"),
        api.list<Product>("products"),
        api.list<UnitMeasure>("unit-measures"),
      ]);
      setBills(b);
      setVendors(v);
      setProducts(p);
      setUnitMeasures(u);
    } catch {
      toast({ message: "Failed to load bills", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("bills", "BILL");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setEditBill(null);
    setView("form");
  }

  function openEdit(bill: Bill) {
    setForm({
      code: bill.code ?? "",
      vendorId: String(bill.vendorId),
      dueDate: bill.dueDate ? bill.dueDate.slice(0, 16) : "",
      status: bill.status,
      description: bill.description ?? "",
    });
    const mappedItems: BillItem[] = bill.items && bill.items.length > 0
      ? bill.items.map((i) => ({
          productId: i.productId ? String(i.productId) : "",
          quantity: String(i.quantity),
          unitPrice: String(Number(i.unitPrice)),
          unitMeasureId: i.unitMeasureId ? String(i.unitMeasureId) : "",
        }))
      : [{ ...EMPTY_ITEM }];
    setItems(mappedItems);
    setErrors({});
    setEditBill(bill);
    setView("form");
  }

  function updateItem(idx: number, patch: Partial<BillItem>) {
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
    if (!form.vendorId) e.vendorId = "Vendor is required";
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
      vendorId: Number(form.vendorId),
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      status: form.status,
      ...(form.description ? { description: form.description } : {}),
      items: itemPayload,
    };
    try {
      if (editBill) {
        await api.update("bills", editBill.id, body);
        toast({ message: "Bill updated", variant: "success" });
      } else {
        await api.create("bills", body);
        toast({ message: "Bill created", variant: "success" });
      }
      setView("list");
      void load();
    } catch {
      toast({ message: editBill ? "Update failed" : "Create failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("bills", id);
      toast({ message: "Bill deleted", variant: "success" });
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
        title={editBill ? `Edit Bill #${editBill.id}` : "New Bill"}
        onBack={() => setView("list")}
        onSave={() => void handleSubmit()}
        onCancel={() => setView("list")}
        saving={saving}
        saveLabel={editBill ? "Save Changes" : "Save Bill"}
      >
        {/* Bill Header */}
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-xs uppercase tracking-wide text-gray-500 border-b pb-2">Bill Header</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="BILL-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Vendor <span className="text-red-500">*</span></label>
              <SearchSelect
                options={vendors.map((v) => ({ value: v.id, label: v.name }))}
                value={form.vendorId ? Number(form.vendorId) : null}
                onChange={(v) => setForm((f) => ({ ...f, vendorId: v != null ? String(v) : "" }))}
                placeholder="Select vendor…"
                hasError={!!errors.vendorId}
                clearable
              />
              {errors.vendorId && <p className="text-xs text-red-600 mt-1">{errors.vendorId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Due Date</label>
              <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description (optional)</label>
              <input type="text" placeholder="General description…" className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
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
      </PageForm>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────────────────────────────
  const columns: TableColumn<Bill>[] = [
    { key: "id", label: "#", width: "60px", render: (r) => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "vendor", label: "Vendor", render: (r) => r.vendor?.name ?? String(r.vendorId) },
    { key: "total", label: "Total", align: "right", render: (r) => <span className="font-semibold">${Number(r.total).toFixed(2)}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—" },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Bills"
        subtitle={`${bills.length} bill${bills.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Bill</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={bills}
          loading={loading}
          emptyMessage="No bills yet"
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Bill</Button>}
          onEdit={openEdit}
          onDelete={(bill) => setConfirmDelete({ id: bill.id, label: bill.code ? `Bill ${bill.code}` : `Bill #${bill.id}` })}
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
