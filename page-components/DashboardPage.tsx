"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, TrendingDown, Users, Activity } from "lucide-react";
import { api } from "@/lib/api";

interface StatCard {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const stats: StatCard[] = [
  { label: "Total Orders", value: "—", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Revenue", value: "—", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
  { label: "Expenses", value: "—", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" },
  { label: "Customers", value: "—", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

export function DashboardPage() {
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

  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`rounded-full ${card.bg} p-3`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend status */}
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-700">System Status</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Check backend
          </button>
          <span className="text-sm">
            {backendOk ? (
              <span className="text-green-600 font-medium">✓ Backend: OK</span>
            ) : error ? (
              <span className="text-red-600">✗ {error}</span>
            ) : (
              <span className="text-gray-400">Checking…</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
