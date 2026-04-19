"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { fetchNextCode } from "@/lib/generateCode";
import { CrudLayout } from "@/components/layout/CrudLayout";
import { PageTable, TableColumn } from "@/components/layout/PageTable";
import { PageForm } from "@/components/layout/PageForm";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tracking {
  id: number;
  code?: string | null;
  transferId: number;
  status: string;
  location?: string | null;
  updatedAt: string;
  transfer?: { id: number; code?: string | null };
}

interface TransferRef { id: number; code?: string | null; status?: string | null }

type FormState = { code: string; transferId: string; status: string; location: string };
const EMPTY_FORM: FormState = { code: "", transferId: "", status: "", location: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function TrackingPage() {
  const [records, setRecords] = useState<Tracking[]>([]);
  const [transfers, setTransfers] = useState<TransferRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Tracking | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ts, trs] = await Promise.all([api.list<Tracking>("tracking"), api.list<TransferRef>("transfers")]);
      setRecords(ts);
      setTransfers(trs);
    } catch {
      toast({ message: "Failed to load tracking", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("tracking", "TRK");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(t: Tracking) {
    setForm({ code: t.code ?? "", transferId: String(t.transferId), status: t.status, location: t.location ?? "" });
    setErrors({});
    setEditing(t);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.transferId) e.transferId = "Transfer is required";
    if (!form.status.trim()) e.status = "Status is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      transfer_id: Number(form.transferId),
      status: form.status,
      ...(form.code ? { code: form.code } : {}),
      ...(form.location ? { location: form.location } : {}),
    };
    try {
      if (editing) {
        await api.update("tracking", editing.id, body);
        toast({ message: "Tracking updated", variant: "success" });
      } else {
        await api.create("tracking", body);
        toast({ message: "Tracking created", variant: "success" });
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
      await api.remove("tracking", id);
      toast({ message: "Tracking deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Tracking" : "New Tracking"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Transfer <span className="text-red-500">*</span></label>
              <select className={errors.transferId ? errInputCls : inputCls} value={form.transferId} onChange={(e) => setForm((f) => ({ ...f, transferId: e.target.value }))}>
                <option value="">Select transfer…</option>
                {transfers.map((t) => <option key={t.id} value={t.id}>{t.code ? `(${t.code}) ` : `#${t.id} `}{t.status}</option>)}
              </select>
              {errors.transferId && <p className="text-xs text-red-600 mt-1">{errors.transferId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="TRK-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Status <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. In Warehouse" className={errors.status ? errInputCls : inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
              {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
              <input type="text" className={inputCls} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Tracking>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "transfer", label: "Transfer", render: (r) => r.transfer?.code ?? `#${r.transferId}` },
    { key: "status", label: "Status" },
    { key: "location", label: "Location", render: (r) => r.location ?? "—" },
    { key: "updatedAt", label: "Updated", render: (r) => formatDate(r.updatedAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Tracking"
        subtitle={`${records.length} record${records.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Tracking</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={records}
          loading={loading}
          emptyMessage="No tracking records yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Tracking</Button>}
          onEdit={openEdit}
          onDelete={(t) => setConfirmDelete({ id: t.id, label: t.code ? `Tracking ${t.code}` : `Tracking #${t.id}` })}
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
