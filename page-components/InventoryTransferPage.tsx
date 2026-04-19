"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SearchSelect } from "@/components/SearchSelect";
import { useRouter } from "next/navigation";

interface Product { id: number; name: string; code?: string | null; inventory?: { quantity: number; location?: string | null } | null }

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function InventoryTransferPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/inventory", { headers: { "x-user-id": "1" } });
    const data = await res.json();
    setProducts(data);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = products.find((p) => String(p.id) === productId);

  // Auto-fill fromLocation from inventory record
  useEffect(() => {
    if (selected?.inventory?.location) setFromLocation(selected.inventory.location);
  }, [selected]);

  function validate() {
    const e: Record<string, string> = {};
    if (!productId) e.productId = "Select a product";
    if (!quantity || Number(quantity) <= 0) e.quantity = "Enter a positive quantity";
    if (!toLocation.trim()) e.toLocation = "Destination location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ productId: Number(productId), quantity: Number(quantity), fromLocation: fromLocation || undefined, toLocation: toLocation || undefined, reference: reference || undefined, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error();
      toast({ message: "Transfer recorded", variant: "success" });
      router.push("/app/inventory");
    } catch {
      toast({ message: "Failed to record transfer", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/app/inventory")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-blue-600" /> Transfer Stock
        </h1>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Product <span className="text-red-500">*</span></label>
          <SearchSelect
            options={products.map((p) => ({ value: p.id, label: p.name, sublabel: p.code ?? undefined }))}
            value={productId ? Number(productId) : null}
            onChange={(v) => setProductId(v != null ? String(v) : "")}
            placeholder="Select product…"
            hasError={!!errors.productId}
            clearable
          />
          {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
          {selected && (
            <p className="text-xs text-gray-500 mt-1">
              Current stock: <span className="font-semibold">{selected.inventory?.quantity ?? 0}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Quantity <span className="text-red-500">*</span></label>
          <input type="number" min={1} className={errors.quantity ? inputCls + " border-red-500" : inputCls} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">From Location</label>
            <input type="text" placeholder="Warehouse A…" className={inputCls} value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">To Location <span className="text-red-500">*</span></label>
              <input type="text" placeholder="Warehouse B…" className={errors.toLocation ? inputCls + " border-red-500" : inputCls} value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
              {errors.toLocation && <p className="text-xs text-red-600 mt-1">{errors.toLocation}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Reference</label>
          <input type="text" className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
          <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/app/inventory")}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} disabled={saving}>
          {saving ? "Saving…" : "Record Transfer"}
        </Button>
      </div>
    </div>
  );
}
