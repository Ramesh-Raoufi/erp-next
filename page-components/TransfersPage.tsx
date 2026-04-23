"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { fetchNextCode } from "@/lib/generateCode";
import { SearchSelect } from "@/components/SearchSelect";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TransferStatus = "assigned" | "in_transit" | "completed";

interface Transfer {
  id: number;
  code?: string | null;
  orderId: number;
  driverId?: number | null;
  status: TransferStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  order?: { id: number; code?: string | null };
  driver?: { id: number; name: string } | null;
}

interface OrderRef { id: number; code?: string | null; origin?: string | null; destination?: string | null; customer?: { name?: string | null; lastName?: string | null } }
interface DriverRef { id: number; name: string; code?: string | null }

const STATUS_STYLES: Record<TransferStatus, string> = {
  assigned: "bg-gray-100 text-gray-600",
  in_transit: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

function StatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

type FormState = { code: string; orderId: string; driverId: string; status: string; vehicleInfo: string; shippedAt: string; deliveredAt: string };
const EMPTY_FORM: FormState = { code: "", orderId: "", driverId: "", status: "assigned", vehicleInfo: "", shippedAt: "", deliveredAt: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [orderRefs, setOrderRefs] = useState<OrderRef[]>([]);
  const [driverRefs, setDriverRefs] = useState<DriverRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ts, os, ds] = await Promise.all([
        api.list<Transfer>("transfers"),
        api.list<OrderRef>("orders"),
        api.list<DriverRef>("drivers"),
      ]);
      setTransfers(ts);
      setOrderRefs(os);
      setDriverRefs(ds);
    } catch {
      toast({ message: "Failed to load transfers", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("transfers", "TRF");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(t: Transfer) {
    setForm({
      code: t.code ?? "",
      orderId: String(t.orderId),
      driverId: t.driverId != null ? String(t.driverId) : "",
      status: t.status,
      vehicleInfo: "",
      shippedAt: t.shippedAt ? t.shippedAt.slice(0, 16) : "",
      deliveredAt: t.deliveredAt ? t.deliveredAt.slice(0, 16) : "",
    });
    setErrors({});
    setEditing(t);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.orderId) e.orderId = "Order is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      order_id: Number(form.orderId),
      status: form.status,
      ...(form.code ? { code: form.code } : {}),
      ...(form.driverId ? { driver_id: Number(form.driverId) } : {}),
      ...(form.vehicleInfo ? { vehicle_info: form.vehicleInfo } : {}),
      ...(form.shippedAt ? { shipped_at: form.shippedAt } : {}),
      ...(form.deliveredAt ? { delivered_at: form.deliveredAt } : {}),
    };
    try {
      if (editing) {
        await api.update("transfers", editing.id, body);
        toast({ message: "Transfer updated", variant: "success" });
      } else {
        await api.create("transfers", body);
        toast({ message: "Transfer created", variant: "success" });
      }
      setView("list");
      void load();
    } catch {
      toast({ message: editing ? "Update failed" : "Create failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("transfers", id);
      toast({ message: "Transfer deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  const filteredTransfers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter((transfer) =>
      [transfer.code, transfer.order?.code, transfer.driver?.name, transfer.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [transfers, query]);

  const assignedCount = transfers.filter((transfer) => transfer.status === "assigned").length;
  const inTransitCount = transfers.filter((transfer) => transfer.status === "in_transit").length;
  const completedCount = transfers.filter((transfer) => transfer.status === "completed").length;

  if (view === "form") {
    return (
      <PageForm
        title={editing ? `Edit Transfer #${editing.id}` : "New Transfer"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Order <span className="text-red-500">*</span></label>
              <SearchSelect
                options={orderRefs.map((o) => {
                  const cust = o.customer;
                  const name = cust ? `${cust.name ?? ""}${cust.lastName ? " " + cust.lastName : ""}`.trim() : "";
                  const route = o.origin && o.destination ? ` — ${o.origin} → ${o.destination}` : "";
                  return { value: o.id, label: `${o.code ? `(${o.code})` : `#${o.id}`} ${name}${route}`.trim() };
                })}
                value={form.orderId ? Number(form.orderId) : null}
                onChange={(v) => setForm((f) => ({ ...f, orderId: v != null ? String(v) : "" }))}
                placeholder="Select order…"
                hasError={!!errors.orderId}
                clearable
              />
              {errors.orderId && <p className="text-xs text-red-600 mt-1">{errors.orderId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="TRF-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Driver (optional)</label>
              <SearchSelect
                options={driverRefs.map((d) => ({ value: d.id, label: d.name, sublabel: d.code ?? undefined }))}
                value={form.driverId ? Number(form.driverId) : null}
                onChange={(v) => setForm((f) => ({ ...f, driverId: v != null ? String(v) : "" }))}
                placeholder="— None —"
                clearable
                quickCreate={{
                  label: "Add New Driver",
                  fields: [
                    { key: "name", label: "Name", required: true },
                    { key: "phone", label: "Phone", type: "tel", required: true },
                    { key: "licenseNumber", label: "License Number", required: true },
                    { key: "vehicleType", label: "Vehicle Type", required: true },
                  ],
                  onSave: async (data) => {
                    const res = await fetch("/api/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                    const created = await res.json();
                    setDriverRefs((prev) => [...prev, created]);
                    return { id: created.id, name: created.name };
                  },
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="assigned">Assigned</option>
                <option value="in_transit">In Transit</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle Info</label>
              <input type="text" className={inputCls} value={form.vehicleInfo} onChange={(e) => setForm((f) => ({ ...f, vehicleInfo: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Shipped At</label>
              <input type="datetime-local" className={inputCls} value={form.shippedAt} onChange={(e) => setForm((f) => ({ ...f, shippedAt: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Delivered At</label>
              <input type="datetime-local" className={inputCls} value={form.deliveredAt} onChange={(e) => setForm((f) => ({ ...f, deliveredAt: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Transfer>[] = [
    {
      key: "transfer",
      label: "Transfer",
      render: (r) => (
        <div className="min-w-[140px]">
          <p className="font-medium text-slate-900">{r.code ?? `#${r.id}`}</p>
          <p className="text-xs text-slate-500">Order {r.order?.code ? r.order.code : `#${r.orderId}`}</p>
        </div>
      ),
    },
    {
      key: "driver",
      label: "Driver",
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.driver?.name ?? "Unassigned"}</p>
          <p className="text-xs text-slate-500">{r.shippedAt ? `Shipped ${formatDate(r.shippedAt)}` : "Not shipped yet"}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "deliveredAt", label: "Delivered", render: (r) => <span className="text-slate-900">{r.deliveredAt ? formatDate(r.deliveredAt) : "—"}</span> },
  ];

  return (
    <>
      <CrudLayout
        title="Transfers"
        subtitle={`${transfers.length} transfer${transfers.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Transfer</Button>
          </>
        }
      >
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Assigned</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{assignedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">In transit</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{inTransitCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{completedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Transfer list</h2>
                <p className="mt-1 text-sm text-slate-500">Monitor assigned shipments, delivery progress, and transport ownership in one place.</p>
              </div>
              <div className="w-full lg:w-[320px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search transfers..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{filteredTransfers.length}</span> of {transfers.length} transfers.
            </p>
          </div>

          <PageTable
            columns={columns}
            data={filteredTransfers}
            loading={loading}
            emptyMessage="No transfers yet. Create your first transfer to start shipment tracking."
            emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Transfer</Button>}
            onEdit={openEdit}
            onDelete={(t) => setConfirmDelete({ id: t.id, label: t.code ? `Transfer ${t.code}` : `Transfer #${t.id}` })}
          />
        </div>
      </CrudLayout>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && void handleDelete(confirmDelete.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
