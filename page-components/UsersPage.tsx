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

type UserRole = "admin" | "operator" | "accountant" | "driver";

interface User {
  id: number;
  code?: string | null;
  name: string;
  lastName?: string | null;
  username: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
}

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  operator: "bg-blue-100 text-blue-700",
  accountant: "bg-green-100 text-green-700",
  driver: "bg-orange-100 text-orange-700",
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_STYLES[role] ?? "bg-gray-100 text-gray-600"}`}>
      {role}
    </span>
  );
}

type FormState = { code: string; name: string; lastName: string; username: string; email: string; phone: string; password: string; role: string };
const EMPTY_FORM: FormState = { code: "", name: "", lastName: "", username: "", email: "", phone: "", password: "", role: "operator" };
const inputCls = "w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errInputCls = "w-full rounded-md border border-red-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const formatDate = (s: string) => new Date(s).toLocaleDateString();

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await api.list<User>("users"));
    } catch {
      toast({ message: "Failed to load users", variant: "error" });
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

  function openEdit(u: User) {
    setForm({ code: u.code ?? "", name: u.name, lastName: u.lastName ?? "", username: u.username, email: u.email ?? "", phone: u.phone ?? "", password: "", role: u.role });
    setErrors({});
    setEditing(u);
    setView("form");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!editing && !form.password) e.password = "Password is required for new users";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const body: Record<string, unknown> = {
      name: form.name,
      username: form.username,
      role: form.role,
      ...(form.code ? { code: form.code } : {}),
      ...(form.lastName ? { lastName: form.lastName } : {}),
      ...(form.email ? { email: form.email } : {}),
      ...(form.phone ? { phone: form.phone } : {}),
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editing) {
        await api.update("users", editing.id, body);
        toast({ message: "User updated", variant: "success" });
      } else {
        await api.create("users", body);
        toast({ message: "User created", variant: "success" });
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
      await api.remove("users", id);
      toast({ message: "User deleted", variant: "success" });
      void load();
    } catch {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  if (view === "form") {
    return (
      <PageForm
        title={editing ? "Edit User" : "New User"}
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
              <label className="block text-sm font-medium mb-1 text-gray-700">Username <span className="text-red-500">*</span></label>
              <input type="text" className={errors.username ? errInputCls : inputCls} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input type="text" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input type="text" className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password {!editing && <span className="text-red-500">*</span>}
                {editing && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
              </label>
              <input type="password" className={errors.password ? errInputCls : inputCls} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
              <select className={inputCls} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="accountant">Accountant</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>
        </div>
      </PageForm>
    );
  }

  const columns: TableColumn<User>[] = [
    { key: "name", label: "Name", render: (r) => `${r.name}${r.lastName ? " " + r.lastName : ""}` },
    { key: "username", label: "Username" },
    { key: "email", label: "Email", render: (r) => r.email ?? "—" },
    { key: "role", label: "Role", render: (r) => <RoleBadge role={r.role} /> },
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <CrudLayout
        title="Users"
        subtitle={`${users.length} user${users.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New User</Button>
          </>
        }
      >
        <PageTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users yet."
          emptyAction={<Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> New User</Button>}
          onEdit={openEdit}
          onDelete={(u) => setConfirmDelete({ id: u.id, label: u.name })}
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
