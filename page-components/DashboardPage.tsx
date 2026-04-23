"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingDown,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface StatCard {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: string;
  helper: string;
}

const statCards: StatCard[] = [
  {
    label: "Orders",
    value: "Live overview",
    icon: ShoppingBag,
    tone: "bg-blue-50 text-blue-600",
    helper: "Track purchase and sales activity.",
  },
  {
    label: "Revenue",
    value: "Finance snapshot",
    icon: DollarSign,
    tone: "bg-emerald-50 text-emerald-600",
    helper: "Monitor revenue and cash movement.",
  },
  {
    label: "Expenses",
    value: "Cost watch",
    icon: TrendingDown,
    tone: "bg-rose-50 text-rose-600",
    helper: "Watch outgoing spend and pressure points.",
  },
  {
    label: "Customers",
    value: "Relationship view",
    icon: Users,
    tone: "bg-violet-50 text-violet-600",
    helper: "Keep an eye on customer growth.",
  },
];

const quickActions = [
  { title: "Add product", href: "/app/products", description: "Update catalog and stock-ready items." },
  { title: "Create order", href: "/app/orders", description: "Open and manage new order records." },
  { title: "View reports", href: "/app/reports", description: "Check performance and business trends." },
];

export function DashboardPage() {
  const { user, loginAt } = useAuth();
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.health();
      setBackendOk(res.ok);
    } catch (e) {
      setBackendOk(null);
      setError(e instanceof Error ? e.message : "Health check failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const welcomeName = useMemo(() => {
    const full = [user?.name, user?.lastName].filter(Boolean).join(" ").trim();
    return full || user?.username || "there";
  }, [user]);

  const sessionText = useMemo(() => {
    if (!loginAt) return "Session started recently.";
    const date = new Date(loginAt);
    if (Number.isNaN(date.getTime())) return "Session started recently.";
    return `Signed in ${date.toLocaleString()}`;
  }, [loginAt]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Operations overview</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {welcomeName}.</h1>
            <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              This dashboard is your quick control center for products, orders, finance, and system health.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session</p>
              <p className="mt-2 text-sm font-medium text-white">{sessionText}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">System</p>
              <p className="mt-2 text-sm font-medium text-white">
                {backendOk ? "Backend healthy" : error ? "Needs attention" : "Checking status"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{card.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{card.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">Jump into the most common ERP tasks.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {quickActions.map((action) => (
              <a
                key={action.title}
                href={action.href}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{action.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">System status</h2>
              <p className="text-sm text-slate-500">Keep an eye on backend availability.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Backend health</p>
                <p className="mt-1 text-sm text-slate-500">
                  {backendOk ? "API is responding normally." : error ? error : "Running initial health check..."}
                </p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  backendOk
                    ? "bg-emerald-100 text-emerald-700"
                    : error
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {backendOk ? "Healthy" : error ? "Issue" : "Checking"}
              </div>
            </div>

            <button
              onClick={load}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Recheck backend
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Recommended next upgrade</p>
                <p className="mt-1 text-sm text-slate-500">
                  Add real KPI metrics and low-stock alerts to make this dashboard operational, not just visual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
