"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";

type MovementType = "receive" | "exit" | "transfer" | "adjustment";

interface JournalEntry {
  id: number;
  code?: string | null;
  productId: number;
  type: MovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
  product?: { id: number; name: string; code?: string | null } | null;
}

const TYPE_STYLES: Record<MovementType, string> = {
  receive:    "bg-green-100 text-green-700",
  exit:       "bg-red-100 text-red-700",
  transfer:   "bg-blue-100 text-blue-700",
  adjustment: "bg-yellow-100 text-yellow-700",
};

function TypeBadge({ type }: { type: MovementType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TYPE_STYLES[type] ?? "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
}

export function InventoryJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/journal", { headers: { "x-user-id": "1" } });
      const data = await res.json();
      setEntries(data);
    } catch {
      toast({ message: "Failed to load journal", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  const columns: TableColumn<JournalEntry>[] = [
    { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: "product", label: "Product", render: (r) => r.product?.name ?? String(r.productId) },
    { key: "type", label: "Type", render: (r) => <TypeBadge type={r.type} /> },
    { key: "quantity", label: "Qty", align: "right", render: (r) => <span className="font-semibold tabular-nums">{r.quantity}</span> },
    { key: "quantityBefore", label: "Before", align: "right", render: (r) => <span className="tabular-nums text-gray-500">{r.quantityBefore}</span> },
    { key: "quantityAfter", label: "After", align: "right", render: (r) => <span className="tabular-nums font-medium">{r.quantityAfter}</span> },
    { key: "reference", label: "Reference", render: (r) => r.reference ?? <span className="text-gray-400">—</span> },
    { key: "notes", label: "Notes", render: (r) => r.notes ?? <span className="text-gray-400">—</span> },
  ];

  return (
    <CrudLayout
      title="Inventory Journal"
      subtitle={`${entries.length} entr${entries.length !== 1 ? "ies" : "y"}`}
      actions={
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      }
    >
      <PageTable
        columns={columns}
        data={entries}
        loading={loading}
        emptyMessage="No journal entries yet."
      />
    </CrudLayout>
  );
}
