"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus, RefreshCw, Search } from "lucide-react";
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

interface UnitMeasure { id: number; code?: string | null; name: string }

interface Product {
  id: number;
  code?: string | null;
  name: string;
  category?: string | null;
  price: string;
  quantity: number;
  isActive: boolean;
  weight?: number | null;
  compareAtPrice?: string | null;
  description?: string | null;
  unitMeasureId?: number | null;
  unitMeasure?: UnitMeasure | null;
  createdAt: string;
}

type FormState = {
  code: string; name: string; category: string; price: string; quantity: string;
  isActive: string; weight: string; compareAtPrice: string; description: string; unitMeasureId: string;
};
const EMPTY_FORM: FormState = {
  code: "", name: "", category: "", price: "0", quantity: "0",
  isActive: "true", weight: "", compareAtPrice: "", description: "", unitMeasureId: "",
};

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, uns] = await Promise.all([
        api.list<Product>("products"),
        api.list<UnitMeasure>("unit-measures"),
      ]);
      setProducts(prods);
      setUnits(uns);
    } catch {
      toast({ message: "Failed to load products", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("products", "PRD");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(p: Product) {
    setForm({
      code: p.code ?? "",
      name: p.name,
      category: p.category ?? "",
      price: p.price ?? "0",
      quantity: String(p.quantity ?? 0),
      isActive: String(p.isActive ?? true),
      weight: p.weight != null ? String(p.weight) : "",
      compareAtPrice: p.compareAtPrice ?? "",
      description: p.description ?? "",
      unitMeasureId: p.unitMeasureId != null ? String(p.unitMeasureId) : "",
    });
    setErrors({});
    setEditing(p);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      name: form.name,
      price: form.price || "0",
      quantity: parseInt(form.quantity || "0", 10),
      isActive: form.isActive === "true",
      ...(form.code ? { code: form.code } : {}),
      ...(form.category ? { category: form.category } : {}),
      ...(form.description ? { description: form.description } : {}),
      ...(form.weight ? { weight: parseFloat(form.weight) } : {}),
      ...(form.compareAtPrice ? { compareAtPrice: form.compareAtPrice } : {}),
      ...(form.unitMeasureId ? { unitMeasureId: parseInt(form.unitMeasureId, 10) } : {}),
    };
    try {
      if (editing) {
        await api.update("products", editing.id, body);
        toast({ message: "Product updated", variant: "success" });
      } else {
        await api.create("products", body);
        toast({ message: "Product created", variant: "success" });
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
      await api.remove("products", id);
      toast({ message: "Product deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.code, product.name, product.category, product.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [products, query]);

  const activeCount = products.filter((product) => product.isActive).length;
  const lowStockCount = products.filter((product) => product.quantity <= 5).length;
  const inventoryValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0),
    0,
  );

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Product" : "New Product"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="00001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" className={errors.name ? errInputCls : inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <input type="text" className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Price</label>
              <input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Compare At Price</label>
              <input type="number" step="0.01" min="0" className={inputCls} value={form.compareAtPrice} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quantity</label>
              <input type="number" min="0" className={inputCls} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Weight</label>
              <input type="number" step="0.001" min="0" className={inputCls} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit Measure</label>
              <SearchSelect
                options={units.map((u) => ({ value: u.id, label: u.code ? `${u.code} - ${u.name}` : u.name }))}
                value={form.unitMeasureId ? Number(form.unitMeasureId) : null}
                onChange={(v) => setForm((f) => ({ ...f, unitMeasureId: v != null ? String(v) : "" }))}
                placeholder="— None —"
                clearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Active</label>
              <select className={inputCls} value={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value }))}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
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

  const columns: TableColumn<Product>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (r) => r.category ?? "—" },
    { key: "price", label: "Price", align: "right", render: (r) => `$${Number(r.price).toFixed(2)}` },
    { key: "quantity", label: "Qty", align: "right" },
    { key: "isActive", label: "Status", render: (r) => <ActiveBadge active={r.isActive} /> },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Product</Button>
          </>
        }
      >
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Product overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage your catalog with less friction</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Search products quickly, watch low stock items, and keep pricing and inventory clean from one screen.
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{activeCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Low stock</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">{lowStockCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventory value</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">${inventoryValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-medium text-slate-700">Search products</label>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by code, name, category..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white"
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{filteredProducts.length}</span> of {products.length} products.
            </p>
          </div>
        </div>

        <PageTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyMessage="No products yet. Add your first product."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Product</Button>}
          onEdit={openEdit}
          onDelete={(p) => setConfirmDelete({ id: p.id, label: p.name })}
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
