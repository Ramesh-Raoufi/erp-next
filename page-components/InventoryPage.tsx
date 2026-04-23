"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, PackagePlus, PackageMinus, ArrowLeftRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import Link from "next/link";

interface InventoryProduct {
  id: number;
  code?: string | null;
  name: string;
  inventory?: {
    id: number;
    quantity: number;
    minQuantity: number;
    maxQuantity?: number | null;
    location?: string | null;
    updatedAt: string;
  } | null;
  unitMeasure?: { id: number; name: string; symbol?: string | null } | null;
}

function StockBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0) return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700">Out of Stock</span>;
  if (qty <= min) return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">Low Stock</span>;
  return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">In Stock</span>;
}

export function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { headers: { "x-user-id": "1" } });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.items ?? data.data ?? []);
    } catch {
      toast({ message: "Failed to load inventory", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.code, product.name, product.inventory?.location, product.unitMeasure?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [products, query]);

  const outOfStockCount = products.filter((product) => (product.inventory?.quantity ?? 0) === 0).length;
  const lowStockCount = products.filter((product) => {
    const qty = product.inventory?.quantity ?? 0;
    const min = product.inventory?.minQuantity ?? 0;
    return qty > 0 && qty <= min;
  }).length;
  const totalUnits = products.reduce((sum, product) => sum + (product.inventory?.quantity ?? 0), 0);

  const columns: TableColumn<InventoryProduct>[] = [
    {
      key: "product",
      label: "Product",
      render: (r) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-slate-900">{r.name}</p>
          <p className="text-xs text-slate-500">{r.code ?? "No code"}</p>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (r) => (
        <div>
          <p className="font-semibold tabular-nums text-slate-900">
            {r.inventory?.quantity ?? 0}
            {r.unitMeasure?.symbol ? <span className="ml-1 text-xs text-slate-400">{r.unitMeasure.symbol}</span> : null}
          </p>
          <p className="text-xs text-slate-500">Min {r.inventory?.minQuantity ?? 0}</p>
        </div>
      ),
    },
    { key: "location", label: "Location", render: (r) => <span className="text-slate-900">{r.inventory?.location ?? "—"}</span> },
    {
      key: "status",
      label: "Status",
      render: (r) => <StockBadge qty={r.inventory?.quantity ?? 0} min={r.inventory?.minQuantity ?? 0} />,
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (r) => <span className="text-slate-900">{r.inventory?.updatedAt ? new Date(r.inventory.updatedAt).toLocaleDateString() : "—"}</span>,
    },
  ];

  return (
    <CrudLayout
      title="Inventory"
      subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/app/inventory/receive">
            <Button size="sm" variant="outline"><PackagePlus className="mr-1 h-4 w-4" /> Receive</Button>
          </Link>
          <Link href="/app/inventory/exit">
            <Button size="sm" variant="outline"><PackageMinus className="mr-1 h-4 w-4" /> Exit</Button>
          </Link>
          <Link href="/app/inventory/transfer">
            <Button size="sm" variant="outline"><ArrowLeftRight className="mr-1 h-4 w-4" /> Transfer</Button>
          </Link>
        </>
      }
    >
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Units on hand</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{totalUnits}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Low stock</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Out of stock</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{outOfStockCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Inventory list</h2>
              <p className="mt-1 text-sm text-slate-500">Review stock levels, locations, and restock risks in one place.</p>
            </div>
            <div className="w-full lg:w-[320px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search inventory..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredProducts.length}</span> of {products.length} products.
          </p>
        </div>

        <PageTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyMessage="No products found in inventory."
        />
      </div>
    </CrudLayout>
  );
}
