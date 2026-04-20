"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, PackageMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SearchSelect } from "@/components/SearchSelect";
import { useRouter } from "next/navigation";

interface Product { id: number; name: string; code?: string | null; inventory?: { quantity: number; location?: string | null } | null }

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function InventoryExitPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/inventory", { headers: { "x-user-id": "1" } });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : data.items ?? data.data ?? []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = products.find((p) => String(p.id) === productId);

  function validate() {
    const e: Record<string, string> = {};
    if (!productId) e.productId = "Select a product";
    if (!quantity || Number(quantity) <= 0) e.quantity = "Enter a positive quantity";
    if (selected && (selected.inventory?.quantity ?? 0) < Number(quantity)) e.quantity = "Insufficient stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ productId: Number(productId), quantity: Number(quantity), reference: reference || undefined, notes: notes || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      toast({ message: "Stock exit recorded", variant: "success" });
      router.push("/app/inventory");
    } catch (err: unknown) {
      toast({ message: err instanceof Error ? err.message : "Failed to record exit", variant: "error" });
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
          <PackageMinus className="h-5 w-5 text-red-600" /> Exit Stock
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
            quickCreate={{
              label: "Add New Product",
              fields: [
                { key: "name", label: "Name", required: true },
                { key: "price", label: "Price", required: true },
                { key: "quantity", label: "Initial Quantity", required: true },
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
          {errors.productId && <p className="text-xs text-red-600 mt-1">{errors.productId}</p>}
          {selected && (
            <p className="text-xs mt-1">
              Current stock:{" "}
              <span className={`font-semibold ${(selected.inventory?.quantity ?? 0) === 0 ? "text-red-600" : "text-gray-700"}`}>
                {selected.inventory?.quantity ?? 0}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Quantity <span className="text-red-500">*</span></label>
          <input type="number" min={1} className={errors.quantity ? inputCls + " border-red-500" : inputCls} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Reference</label>
          <input type="text" placeholder="Order ref, shipment…" className={inputCls} value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
          <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/app/inventory")}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? "Saving…" : "Record Exit"}
        </Button>
      </div>
    </div>
  );
}
