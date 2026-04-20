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

type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

interface Customer { id: number; name: string; lastName?: string | null; code?: string | null }
interface Product { id: number; name: string; code?: string | null; price?: string; unitMeasureId?: number | null }
interface UnitMeasure { id: number; name: string; code?: string | null }

interface OrderItem {
  productId: string;
  quantity: string;
  unitPrice: string;
  unitMeasureId: string;
}

interface Order {
  id: number;
  code?: string | null;
  customerId: number;
  origin: string;
  destination: string;
  status: OrderStatus;
  totalPrice: string;
  createdAt: string;
  customer?: { id: number; name: string; lastName?: string | null };
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

type FormState = { code: string; customerId: string; origin: string; destination: string; status: string };
const EMPTY_FORM: FormState = { code: "", customerId: "", origin: "", destination: "", status: "pending" };
const EMPTY_ITEM: OrderItem = { productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [items, setItems] = useState<OrderItem[]>([{ ...EMPTY_ITEM }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [os, cs, ps, us] = await Promise.all([
        api.list<Order>("orders"),
        api.list<Customer>("customers"),
        api.list<Product>("products"),
        api.list<UnitMeasure>("unit-measures"),
      ]);
      setOrders(os);
      setCustomers(cs);
      setProducts(ps);
      setUnitMeasures(us);
    } catch {
      toast({ message: "Failed to load orders", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("orders", "ORD");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(o: Order) {
    setForm({ code: o.code ?? "", customerId: String(o.customerId), origin: o.origin, destination: o.destination, status: o.status });
    setItems([{ ...EMPTY_ITEM }]);
    setErrors({});
    setEditing(o);
    setView("form");
  }

  function updateItem(idx: number, patch: Partial<OrderItem>) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      if (patch.productId) {
        const p = products.find((p) => String(p.id) === patch.productId);
        if (p) {
          updated.unitPrice = updated.unitPrice || p.price || "";
          if (p.unitMeasureId && !updated.unitMeasureId) updated.unitMeasureId = String(p.unitMeasureId);
        }
      }
      return updated;
    }));
  }

  const totalPrice = items.reduce((sum, i) => {
    const qty = Number(i.quantity); const price = Number(i.unitPrice);
    return sum + (Number.isFinite(qty) && Number.isFinite(price) ? qty * price : 0);
  }, 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerId) e.customerId = "Customer is required";
    if (!form.origin.trim()) e.origin = "Origin is required";
    if (!form.destination.trim()) e.destination = "Destination is required";
    const validItems = items.filter((i) => i.productId);
    if (validItems.length === 0) e.items = "Add at least one item";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const itemPayload = items
      .filter((i) => i.productId)
      .map((i) => ({
        product_id: Number(i.productId),
        quantity: Number(i.quantity),
        unit_price: i.unitPrice,
        ...(i.unitMeasureId ? { unit_measure_id: Number(i.unitMeasureId) } : {}),
      }));
    const body: Record<string, unknown> = {
      customer_id: Number(form.customerId),
      origin: form.origin,
      destination: form.destination,
      status: form.status,
      ...(form.code ? { code: form.code } : {}),
      items: itemPayload,
    };
    try {
      if (editing) {
        await api.update("orders", editing.id, body);
        toast({ message: "Order updated", variant: "success" });
      } else {
        await api.create("orders", body);
        toast({ message: "Order created", variant: "success" });
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
      await api.remove("orders", id);
      toast({ message: "Order deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? `Edit Order #${editing.id}` : "New Order"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-base text-gray-800 border-b pb-2">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Customer <span className="text-red-500">*</span></label>
              <SearchSelect
                options={customers.map((c) => ({ value: c.id, label: `${c.name}${c.lastName ? " " + c.lastName : ""}`, sublabel: c.code ?? undefined }))}
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
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="ORD-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Origin <span className="text-red-500">*</span></label>
              <input type="text" className={errors.origin ? errInputCls : inputCls} value={form.origin} onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))} />
              {errors.origin && <p className="text-xs text-red-600 mt-1">{errors.origin}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Destination <span className="text-red-500">*</span></label>
              <input type="text" className={errors.destination ? errInputCls : inputCls} value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} />
              {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Total Price</label>
              <input type="text" disabled className={inputCls + " bg-gray-50"} value={totalPrice.toFixed(2)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-base text-gray-800">Order Items</h2>
            <Button variant="outline" size="sm" onClick={() => setItems((p) => [...p, { ...EMPTY_ITEM }])}>
              <PlusCircle className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
          {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Product</label>
                  <SearchSelect
                    options={products.map((p) => ({ value: p.id, label: p.name, sublabel: p.code ?? undefined }))}
                    value={item.productId ? Number(item.productId) : null}
                    onChange={(v) => updateItem(idx, { productId: v != null ? String(v) : "" })}
                    placeholder="Select…"
                    quickCreate={{
                      label: "Add New Product",
                      fields: [
                        { key: "name", label: "Name", required: true },
                        { key: "price", label: "Price", required: true },
                        { key: "quantity", label: "Quantity", required: true },
                        { key: "category", label: "Category" },
                      ],
                      onSave: async (data) => {
                        const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.name, price: data.price, quantity: data.quantity, category: data.category || undefined }) });
                        const created = await res.json();
                        setProducts((prev) => [...prev, created]);
                        return { id: created.id, name: created.name };
                      },
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Qty</label>
                  <input type="number" min={1} className={inputCls} value={item.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unit Price</label>
                  <input type="number" min={0} step="0.01" className={inputCls} value={item.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: e.target.value })} />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Unit</label>
                    <SearchSelect
                      options={unitMeasures.map((u) => ({ value: u.id, label: u.name, sublabel: u.code ?? undefined }))}
                      value={item.unitMeasureId ? Number(item.unitMeasureId) : null}
                      onChange={(v) => updateItem(idx, { unitMeasureId: v != null ? String(v) : "" })}
                      placeholder="—"
                      clearable
                    />
                  </div>
                  {items.length > 1 && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 mb-0.5" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>✕</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Order>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "customer", label: "Customer", render: (r) => r.customer ? `${r.customer.name}${r.customer.lastName ? " " + r.customer.lastName : ""}` : String(r.customerId) },
    { key: "origin", label: "Origin" },
    { key: "destination", label: "Destination" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "totalPrice", label: "Total", align: "right", render: (r) => `$${Number(r.totalPrice).toFixed(2)}` },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Order</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Order</Button>}
          onEdit={openEdit}
          onDelete={(o) => setConfirmDelete({ id: o.id, label: o.code ? `Order ${o.code}` : `Order #${o.id}` })}
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
