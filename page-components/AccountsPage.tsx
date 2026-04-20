"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
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

interface AccountType { id: number; code?: string | null; name: string }

interface Account {
  id: number;
  code?: string | null;
  name: string;
  accountTypeId?: number | null;
  balance: string;
  description?: string | null;
  createdAt: string;
  accountType?: AccountType | null;
}

type FormState = { code: string; name: string; accountTypeId: string; balance: string; description: string };
const EMPTY_FORM: FormState = { code: "", name: "", accountTypeId: "", balance: "0", description: "" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [as_, ats] = await Promise.all([api.list<Account>("accounts"), api.list<AccountType>("account-types")]);
      setAccounts(as_);
      setAccountTypes(ats);
    } catch {
      toast({ message: "Failed to load accounts", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  async function openCreate() {
    const nextCode = await fetchNextCode("accounts", "ACC");
    setForm({ ...EMPTY_FORM, code: nextCode });
    setErrors({});
    setEditing(null);
    setView("form");
  }

  function openEdit(a: Account) {
    setForm({
      code: a.code ?? "",
      name: a.name,
      accountTypeId: a.accountTypeId != null ? String(a.accountTypeId) : "",
      balance: String(a.balance ?? "0"),
      description: a.description ?? "",
    });
    setErrors({});
    setEditing(a);
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
    const body: Record<string, unknown> = {
      name: form.name,
      balance: form.balance || "0",
      ...(form.code ? { code: form.code } : {}),
      ...(form.accountTypeId ? { accountTypeId: Number(form.accountTypeId) } : {}),
      ...(form.description ? { description: form.description } : {}),
    };
    try {
      if (editing) {
        await api.update("accounts", editing.id, body);
        toast({ message: "Account updated", variant: "success" });
      } else {
        await api.create("accounts", body);
        toast({ message: "Account created", variant: "success" });
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
      await api.remove("accounts", id);
      toast({ message: "Account deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit Account" : "New Account"}
        onBack={() => setView("list")}
        onSave={() => void handleSave()}
        onCancel={() => setView("list")}
        saving={saving}
      >
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Code</label>
              <input type="text" placeholder="ACC-001" className={inputCls} value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" className={errors.name ? errInputCls : inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Account Type</label>
              <SearchSelect
                options={accountTypes.map((at) => ({ value: at.id, label: at.code ? `${at.code} ${at.name}` : at.name }))}
                value={form.accountTypeId ? Number(form.accountTypeId) : null}
                onChange={(v) => setForm((f) => ({ ...f, accountTypeId: v != null ? String(v) : "" }))}
                placeholder="— None —"
                clearable
                quickCreate={{
                  label: "Add New Account Type",
                  fields: [
                    { key: "name", label: "Name", required: true },
                    { key: "code", label: "Code" },
                  ],
                  onSave: async (data) => {
                    const res = await fetch("/api/account-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                    const created = await res.json();
                    setAccountTypes((prev) => [...prev, created]);
                    return { id: created.id, name: created.code ? `${created.code} ${created.name}` : created.name };
                  },
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Balance</label>
              <input type="number" step="0.01" className={inputCls} value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<Account>[] = [
    { key: "code", label: "Code", render: (r) => r.code ?? "—" },
    { key: "name", label: "Name" },
    { key: "accountType", label: "Account Type", render: (r) => r.accountType?.name ?? "—" },
    { key: "balance", label: "Balance", align: "right", render: (r) => `$${Number(r.balance).toFixed(2)}` },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Accounts"
        subtitle={`${accounts.length} account${accounts.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Account</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={accounts}
          loading={loading}
          emptyMessage="No accounts yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New Account</Button>}
          onEdit={openEdit}
          onDelete={(a) => setConfirmDelete({ id: a.id, label: a.name })}
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
