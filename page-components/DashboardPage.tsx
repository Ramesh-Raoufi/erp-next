"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function DashboardPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.health();
      setOk(res.ok);
    } catch (e) {
      setOk(null);
      setError(e instanceof Error ? e.message : "Health check failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Quick connection check to the backend.
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Button onClick={load}>Check backend</Button>
          <div className="text-sm">
            {ok ? (
              <span>Backend: OK</span>
            ) : error ? (
              <span className="text-red-600">Backend error: {error}</span>
            ) : (
              <span className="text-muted-foreground">Loading…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
