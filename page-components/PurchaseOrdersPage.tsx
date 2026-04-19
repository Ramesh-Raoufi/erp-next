"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, ArrowLeft, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type POStatus = "draft" | "sent" | "received" | "cancelled";

interface POItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Product { id: number; name: string; price?: string }

interface PurchaseOrder {
  id: number;
  code?: string | null;
  vendorId: number;
  status: POStatus;
  totalAmount: string;
  notes?: string | null;
  expectedAt?: string | null;
  createdAt: string;
  vendor?: { id: number; name: string };
  items?: POItem[];
}

interface Vendor { id: number; name: string }

const STATUS_STYLES: Record<POStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-rose-200 text-rose-900",
};

const STATUS_OPTIONS: { label: string; value: POStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

function StatusBadge({ status }: { status: POStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_LINE: POItem = { productId: 0, quantity: 1, unitPrice: 0, totalPrice: 0 };
type FormState = { code: string; vendorId: string; status: string; notes: string; expectedAt: string; };
const EMPTY_FORM: FormState = { code: "", vendorId: "", status: "draft", notes: "", expectedAt: "" };

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-t animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded w-full" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editOrder, setEditOrder] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<POItem[]>([{ ...EMPTY_LINE }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pos, vs, prods] = await Promise.all([
        api.list<PurchaseOrder>("purchase-orders"),
        api.list<Vendor>("vendors"),
        api.list<Product>("products"),
      ]);
      setOrders(pos);
      setVendors(vs);
      setProducts(prods);
    } catch {
      toast({ message: "Failed to load purchase orders", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setItems([{ ...EMPTY_LINE }]);
    setErrors({});
    setEditOrder(null);
    setView("form");
  }

  function openEdit(po: PurchaseOrder) {
    setForm({
      code: po.code ?? "",
      vendorId: String(po.vendorId),
      status: po.status,
      notes: po.notes ?? "",
      expectedAt: po.expectedAt ? po.expectedAt.slice(0, 16) : "",
    });
    setItems(po.items && po.items.length > 0 ? po.items.map((i) => ({ ...i })) : [{ ...EMPTY_LINE }]);
    setErrors({});
    setEditOrder(po);
    setView("form");
  }

  function updateItem(idx: number, field: keyof POItem, value: string | number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === "productId") {
        const prod = products.find((p) => p.id === Number(value));
        if (prod) { updated.productName = prod.name; updated.unitPrice = Number(prod.price) || 0; }
      }
      updated.totalPrice = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      return updated;
    }));
  }

  function addItem() { setItems((prev) => [...prev, { ...EMPTY_LINE }]); }
  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  const totalAmount = items.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.vendorId) e.vendorId = "Vendor is required";
    items.forEach((item, idx) => {
      if (!item.productId) e[`item_${idx}_product`] = "Product required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    const body = {
      ...(form.code ? { code: form.code } : {}),
      vendorId: Number(form.vendorId),
      status: form.status,
      ...(form.notes ? { notes: form.notes } : {}),
      ...(form.expectedAt ? { expectedAt: form.expectedAt } : {}),
      totalAmount,
      items: items.filter((i) => i.productId).map((i) => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    };
    try {
      if (editOrder) {
        await api.update("purchase-orders", editOrder.id, body);
        toast({ message: "Purchase order updated", variant: "success" });
      } else {
        await api.create("purchase-orders", body);
        toast({ message: "Purchase order created", variant: "success" });
      }
      setView("list");
      void load();
    } catch {
      toast({ message: editOrder ? "Update failed" : "Create failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("purchase-orders", id);
      toast({ message: "Purchase order deleted", variant: "success" });
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
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{editOrder ? `Edit PO #${editOrder.id}` : "New Purchase Order"}</h1>
            <p className="text-sm text-muted-foreground">{editOrder ? "Update purchase order" : "Create a new vendor purchase order"}</p>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold text-base border-b pb-2">Order Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor <span className="text-red-500">*</span></label>
              <select
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.vendorId ? "border-red-500" : "border-input"}`}
                value={form.vendorId}
                onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
              >
                <option value="">Select vendor…</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {errors.vendorId && <p className="text-xs text-red-600 mt-1">{errors.vendorId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text" placeholder="PO-001"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
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
              <label className="block text-sm font-medium mb-1">Expected Date</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.expectedAt}
                onChange={(e) => setForm((f) => ({ ...f, expectedAt: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
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

        {/* Line Items */}
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
                  <th className="text-left py-2 px-2 font-medium w-[35%]">Product</th>
                  <th className="text-right py-2 px-2 font-medium w-[15%]">Qty</th>
                  <th className="text-right py-2 px-2 font-medium w-[20%]">Unit Price</th>
                  <th className="text-right py-2 px-2 font-medium w-[25%]">Total</th>
                  <th className="w-[5%]" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2">
                      <select
                        className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${errors[`item_${idx}_product`] ? "border-red-500" : "border-input"}`}
                        value={item.productId || ""}
                        onChange={(e) => updateItem(idx, "productId", Number(e.target.value))}
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {errors[`item_${idx}_product`] && <p className="text-xs text-red-600 mt-0.5">{errors[`item_${idx}_product`]}</p>}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={1}
                        className="w-full rounded border border-input px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number" min={0} step="0.01"
                        className="w-full rounded border border-input px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-medium">{Number(item.totalPrice).toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <button type="button" title="Remove" onClick={() => removeItem(idx)}
                        className="text-muted-foreground hover:text-red-600 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Total Amount</span>
                <span>{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => setView("list")} disabled={saving}>Cancel</Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Saving…" : (editOrder ? "Save Changes" : "Create Purchase Order")}
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
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">
            Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New PO
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Vendor</th>
              <th className="px-4 py-3 text-right font-medium">Total Amount</th>
              <th className="px-4 py-3 text-left font-medium">Expected</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="font-medium">No purchase orders yet</p>
                    <p className="text-sm">Create your first purchase order.</p>
                    <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New PO</Button>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr key={po.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{po.id}</td>
                  <td className="px-4 py-3">{po.code ?? "—"}</td>
                  <td className="px-4 py-3">{po.vendor?.name ?? po.vendorId}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(po.totalAmount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {po.expectedAt ? new Date(po.expectedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(po)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200"
                        onClick={() => setConfirmDelete({ id: po.id, label: po.code ? `PO ${po.code}` : `PO #${po.id}` })}
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
    </div>
  );
}
