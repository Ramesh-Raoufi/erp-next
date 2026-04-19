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

interface Customer {
  id: number;
  code?: string | null;
  name: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

type FormState = { code: string; name: string; lastName: string; email: string; phone: string };
const EMPTY_FORM: FormState = { code: "", name: "", lastName: "", email: "", phone: "" };

const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCustomers(await api.list<Customer>("customers"));
    } catch {
      toast({ message: "Failed to load customers", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("customers", "CUST");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(c: Customer) {
    setForm({ code: c.code ?? "", name: c.name, lastName: c.lastName ?? "", email: c.email ?? "", phone: c.phone ?? "" });
    setErrors({});
    setEditing(c);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body = { code: form.code || undefined, name: form.name, lastName: form.lastName || undefined, email: form.email || undefined, phone: form.phone || undefined };
    try {
      if (editing) {
        await api.update("customers", editing.id, body);
        toast({ message: "Customer updated", variant: "success" });
      } else {
        await api.create("customers", body);
        toast({ message: "Customer created", variant: "success" });
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
      await api.remove("customers", id);
      toast({ message: "Customer deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Customer" : "New Customer"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="00001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" className={errors.name ? errInputCls : inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Last Name</label>
              <input type="text" className={inputCls} value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input type="text" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input type="text" className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Customer>[] = [
    { key: "name", label: "Name", render: (r) => `${r.name}${r.lastName ? " " + r.lastName : ""}` },
    { key: "email", label: "Email", render: (r) => r.email ?? "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone ?? "—" },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Customers"
        subtitle={`${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Customer</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers yet. Add your first customer."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Customer</Button>}
          onEdit={openEdit}
          onDelete={(c) => setConfirmDelete({ id: c.id, label: c.name })}
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
