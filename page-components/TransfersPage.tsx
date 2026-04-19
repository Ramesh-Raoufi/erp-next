"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
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

  function openCreate() {
    setForm({ ...EMPTY_FORM });
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
              <select className={errors.orderId ? errInputCls : inputCls} value={form.orderId} onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}>
                <option value="">Select order…</option>
                {orderRefs.map((o) => {
                  const cust = o.customer;
                  const name = cust ? `${cust.name ?? ""}${cust.lastName ? " " + cust.lastName : ""}`.trim() : "";
                  const route = o.origin && o.destination ? ` — ${o.origin} → ${o.destination}` : "";
                  return <option key={o.id} value={o.id}>{o.code ? `(${o.code})` : `#${o.id}`} {name}{route}</option>;
                })}
              </select>
              {errors.orderId && <p className="text-xs text-red-600 mt-1">{errors.orderId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="TRF-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Driver (optional)</label>
              <select className={inputCls} value={form.driverId} onChange={(e) => setForm((f) => ({ ...f, driverId: e.target.value }))}>
                <option value="">— None —</option>
                {driverRefs.map((d) => <option key={d.id} value={d.id}>{d.code ? `(${d.code}) ` : ""}{d.name}</option>)}
              </select>
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
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "order", label: "Order", render: (r) => r.order?.code ? r.order.code : `#${r.orderId}` },
    { key: "driver", label: "Driver", render: (r) => r.driver?.name ?? "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "shippedAt", label: "Shipped", render: (r) => r.shippedAt ? formatDate(r.shippedAt) : "—" },
    { key: "deliveredAt", label: "Delivered", render: (r) => r.deliveredAt ? formatDate(r.deliveredAt) : "—" },
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
        <PageTable
          columns={columns}
          data={transfers}
          loading={loading}
          emptyMessage="No transfers yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Transfer</Button>}
          onEdit={openEdit}
          onDelete={(t) => setConfirmDelete({ id: t.id, label: t.code ? `Transfer ${t.code}` : `Transfer #${t.id}` })}
        />
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
