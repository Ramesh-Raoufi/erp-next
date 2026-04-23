"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
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
  const [query, setQuery] = useState("");
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

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      [customer.code, customer.name, customer.lastName, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [customers, query]);

  const withEmailCount = customers.filter((customer) => !!customer.email).length;
  const withPhoneCount = customers.filter((customer) => !!customer.phone).length;

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
    {
      key: "customer",
      label: "Customer",
      render: (r) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-slate-900">{`${r.name}${r.lastName ? " " + r.lastName : ""}`}</p>
          <p className="text-xs text-slate-500">{r.code ?? "No code"}</p>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (r) => (
        <div>
          <p className="text-slate-900">{r.email ?? "No email"}</p>
          <p className="text-xs text-slate-500">{r.phone ?? "No phone"}</p>
        </div>
      ),
    },
    { key: "createdAt", label: "Created", render: (r) => <span className="text-slate-900">{formatDate(r.createdAt)}</span> },
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
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{customers.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">With email</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{withEmailCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">With phone</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{withPhoneCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Customer list</h2>
                <p className="mt-1 text-sm text-slate-500">Keep customer records, contacts, and onboarding progress easy to review.</p>
              </div>
              <div className="w-full lg:w-[320px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{filteredCustomers.length}</span> of {customers.length} customers.
            </p>
          </div>

          <PageTable
            columns={columns}
            data={filteredCustomers}
            loading={loading}
            emptyMessage="No customers yet. Add your first customer to start managing relationships."
            emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Customer</Button>}
            onEdit={openEdit}
            onDelete={(c) => setConfirmDelete({ id: c.id, label: c.name })}
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
