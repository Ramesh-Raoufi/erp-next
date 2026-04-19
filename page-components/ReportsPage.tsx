"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

export function ReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<{
    shipment: string;
    general: string;
    total: string;
  } | null>(null);
  const [profit, setProfit] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<string | null>(null);

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
      setExpenses({
        shipment: e.shipment_expenses,
        general: e.general_expenses,
        total: e.total_expenses,
      });
      setProfit(p.profit);
      setAdjustments(p.adjustments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{t("pages.reports.title")}</h1>
          <div className="text-sm text-muted-foreground">
            {t("pages.reports.subtitle")}
          </div>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {t("crud.refresh")}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-muted-foreground">Total revenue</div>
          <div className="mt-1 text-2xl font-semibold">{revenue ?? "—"}</div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-muted-foreground">Total expenses</div>
          <div className="mt-1 text-2xl font-semibold">
            {expenses?.total ?? "—"}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            shipment: {expenses?.shipment ?? "—"} • general:{" "}
            {expenses?.general ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="text-sm text-muted-foreground">Profit</div>
          <div className="mt-1 text-2xl font-semibold">{profit ?? "—"}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            adjustments: {adjustments ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

