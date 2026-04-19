"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { CrudLayout } from "@/components/layout/CrudLayout";

export function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<{ shipment: string; general: string; total: string } | null>(null);
  const [profit, setProfit] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [r, e, p] = await Promise.all([
        api.reports.revenue(),
        api.reports.expenses(),
        api.reports.profitLoss(),
      ]);
      setRevenue(r.total_revenue);
      setExpenses({ shipment: e.shipment_expenses, general: e.general_expenses, total: e.total_expenses });
      setProfit(p.profit);
      setAdjustments(p.adjustments);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load reports";
      setError(msg);
      toast({ message: msg, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <CrudLayout
      title="Reports"
      subtitle="Financial overview"
      actions={
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      <div className="p-4 space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">{loading ? "—" : (revenue ?? "—")}</div>
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-red-50 to-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">Total Expenses</div>
            <div className="text-3xl font-bold text-gray-900">{loading ? "—" : (expenses?.total ?? "—")}</div>
            {!loading && expenses && (
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <div>Shipment: {expenses.shipment}</div>
                <div>General: {expenses.general}</div>
              </div>
            )}
          </div>
          <div className="rounded-xl border bg-gradient-to-br from-green-50 to-white p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">Profit</div>
            <div className="text-3xl font-bold text-gray-900">{loading ? "—" : (profit ?? "—")}</div>
            {!loading && adjustments && (
              <div className="mt-2 text-xs text-gray-500">Adjustments: {adjustments}</div>
            )}
          </div>
        </div>
      </div>
    </CrudLayout>
  );
}
