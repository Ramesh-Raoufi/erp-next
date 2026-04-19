"use client";
import { useCallback, useEffect, useState } from "react";
import { Printer, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { InvoicePrintView } from "./InvoicePrintView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field } from "@/components/Field";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface Invoice {
  id: number;
  code?: string | null;
  customerId: number;
  orderId?: number | null;
  amount: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  customer?: { id: number; name: string; lastName?: string | null; email?: string | null; phone?: string | null };
  order?: { id: number; code?: string | null; origin?: string; destination?: string; items?: unknown[] } | null;
}

interface Customer { id: number; name: string; lastName?: string | null }

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-rose-200 text-rose-900",
};

const STATUS_OPTIONS: { label: string; value: InvoiceStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const EMPTY_FORM = { code: "", customerId: "", orderId: "", amount: "", dueDate: "", status: "draft", notes: "" };

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Record<string, string>>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, cust] = await Promise.all([
        api.list<Invoice>("invoices"),
        api.list<Customer>("customers"),
      ]);
      setInvoices(inv);
      setCustomers(cust);
    } catch {
      toast({ message: "Failed to load invoices", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setEditInvoice(null);
    setCreateOpen(true);
  }

  function openEdit(inv: Invoice) {
    setForm({
      code: inv.code ?? "",
      customerId: String(inv.customerId),
      orderId: inv.orderId ? String(inv.orderId) : "",
      amount: inv.amount,
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 16) : "",
      status: inv.status,
      notes: inv.notes ?? "",
    });
    setEditInvoice(inv);
    setCreateOpen(true);
  }

  async function handleSubmit() {
    const body: Record<string, unknown> = {
      ...(form.code ? { code: form.code } : {}),
      customerId: Number(form.customerId),
      ...(form.orderId ? { orderId: Number(form.orderId) } : { orderId: null }),
      amount: form.amount,
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
      status: form.status,
      ...(form.notes ? { notes: form.notes } : {}),
    };
    try {
      if (editInvoice) {
        await api.update("invoices", editInvoice.id, body);
        toast({ message: "Invoice updated", variant: "success" });
      } else {
        await api.create("invoices", body);
        toast({ message: "Invoice created", variant: "success" });
      }
      setCreateOpen(false);
      void load();
    } catch (e) {
      toast({ message: editInvoice ? "Update failed" : "Create failed", variant: "error" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.remove("invoices", id);
      toast({ message: "Invoice deleted", variant: "success" });
      void load();
    } catch (e) {
      toast({ message: "Delete failed", variant: "error" });
    }
    setConfirmDelete(null);
  }

  const customerOptions = customers.map((c) => ({
    label: `${c.name}${c.lastName ? " " + c.lastName : ""}`,
    value: String(c.id),
  }));

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Invoices sent to customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New Invoice
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Due Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{loading ? "Loading…" : "No invoices found."}</td></tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.id}</td>
                <td className="px-4 py-3">{inv.code ?? "—"}</td>
                <td className="px-4 py-3">
                  {inv.customer ? `${inv.customer.name}${inv.customer.lastName ? " " + inv.customer.lastName : ""}` : inv.customerId}
                </td>
                <td className="px-4 py-3 font-semibold">{inv.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPrintInvoice(inv)} title="Print">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(inv)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200"
                      onClick={() => setConfirmDelete({ id: inv.id, label: inv.code ? `Invoice ${inv.code}` : `Invoice #${inv.id}` })}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editInvoice ? `Edit Invoice #${editInvoice.id}` : "New Invoice"}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-2 overflow-y-auto max-h-[60vh]">
            <Field
              def={{ name: "code", label: "Code", type: "text", placeholder: "INV-001" }}
              value={form.code}
              onChange={(v) => setForm((f) => ({ ...f, code: v }))}
            />
            <Field
              def={{ name: "customerId", label: "Customer", type: "select", valueType: "number", options: customerOptions }}
              value={form.customerId}
              onChange={(v) => setForm((f) => ({ ...f, customerId: v }))}
            />
            <Field
              def={{ name: "orderId", label: "Order ID (optional)", type: "number" }}
              value={form.orderId}
              onChange={(v) => setForm((f) => ({ ...f, orderId: v }))}
            />
            <Field
              def={{ name: "amount", label: "Amount", type: "money" }}
              value={form.amount}
              onChange={(v) => setForm((f) => ({ ...f, amount: v }))}
            />
            <Field
              def={{ name: "dueDate", label: "Due Date", type: "datetime" }}
              value={form.dueDate}
              onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
            />
            <Field
              def={{
                name: "status",
                label: "Status",
                type: "select",
                options: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })),
              }}
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v }))}
            />
            <Field
              def={{ name: "notes", label: "Notes", type: "text" }}
              value={form.notes}
              onChange={(v) => setForm((f) => ({ ...f, notes: v }))}
            />
          </div>
          <DrawerFooter className="flex gap-2">
            <Button onClick={() => void handleSubmit()}>{editInvoice ? "Save Changes" : "Create Invoice"}</Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && void handleDelete(confirmDelete.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print modal */}
      {printInvoice && (
        <InvoicePrintView invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}
    </div>
  );
}
