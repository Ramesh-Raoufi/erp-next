"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, PackagePlus, PackageMinus, ArrowLeftRight } from "lucide-react";
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
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { headers: { "x-user-id": "1" } });
      const data = await res.json();
      setProducts(data);
    } catch {
      toast({ message: "Failed to load inventory", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const columns: TableColumn<InventoryProduct>[] = [
    { key: "code", label: "Code", render: (r) => <span className="font-mono text-xs text-gray-500">{r.code ?? "—"}</span> },
    { key: "name", label: "Product", render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: "qty", label: "Qty on Hand", align: "right",
      render: (r) => (
        <span className="font-semibold tabular-nums">
          {r.inventory?.quantity ?? 0}
          {r.unitMeasure?.symbol ? <span className="ml-1 text-xs text-gray-400">{r.unitMeasure.symbol}</span> : null}
        </span>
      ),
    },
    { key: "min", label: "Min Qty", align: "right", render: (r) => r.inventory?.minQuantity ?? 0 },
    { key: "location", label: "Location", render: (r) => r.inventory?.location ?? <span className="text-gray-400">—</span> },
    {
      key: "status", label: "Status",
      render: (r) => <StockBadge qty={r.inventory?.quantity ?? 0} min={r.inventory?.minQuantity ?? 0} />,
    },
    {
      key: "updatedAt", label: "Last Updated",
      render: (r) => r.inventory?.updatedAt ? new Date(r.inventory.updatedAt).toLocaleDateString() : "—",
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
      <PageTable
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products found."
      />
    </CrudLayout>
  );
}
