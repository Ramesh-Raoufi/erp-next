"use client";
import { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product?: { name: string };
}

interface Invoice {
  id: number;
  code?: string | null;
  amount: string;
  dueDate?: string | null;
  paidAt?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  customer?: {
    name: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  order?: {
    id: number;
    code?: string | null;
    origin?: string;
    destination?: string;
    items?: unknown[];
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#6b7280",
  sent: "#2563eb",
  paid: "#16a34a",
  overdue: "#dc2626",
  cancelled: "#9f1239",
};

export function InvoicePrintView({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const el = printRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.code ?? "#" + invoice.id}</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111; font-size: 14px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
            .company { font-size: 22px; font-weight: bold; color: #1e40af; }
            .company-sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .invoice-title { font-size: 28px; font-weight: 800; color: #111; text-align: right; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .label { font-size: 11px; color: #6b7280; }
            .value { font-size: 14px; color: #111; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
            td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
            .total-row { font-weight: 700; font-size: 16px; }
            .notes { background: #f9fafb; border-radius: 8px; padding: 12px; font-size: 13px; color: #374151; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #9ca3af; }
            @media print {
              body { padding: 20px; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${el.innerHTML}
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const customerName = invoice.customer
    ? `${invoice.customer.name}${invoice.customer.lastName ? " " + invoice.customer.lastName : ""}`
    : `Customer #${invoice.id}`;
  const statusColor = STATUS_COLORS[invoice.status] ?? "#6b7280";
  const items = (invoice.order?.items ?? []) as OrderItem[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Controls (hidden on print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-3 print:hidden">
          <span className="font-semibold text-gray-800">Invoice Preview</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" /> Print / Save PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef} className="p-8 text-sm text-gray-900">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-blue-700">My Company</div>
              <div className="text-xs text-gray-500">ERP System</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gray-900">INVOICE</div>
              <div className="mt-1 text-base font-semibold text-gray-600">
                {invoice.code ?? `#${invoice.id}`}
              </div>
              <div className="mt-1">
                <span
                  className="invoice-badge inline-block rounded-full px-3 py-0.5 text-xs font-bold capitalize text-white"
                  style={{ backgroundColor: statusColor }}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Dates + Customer grid */}
          <div className="mb-6 grid grid-cols-2 gap-6">
            <div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Bill To</div>
              <div className="font-semibold text-gray-900">{customerName}</div>
              {invoice.customer?.email && <div className="text-gray-500">{invoice.customer.email}</div>}
              {invoice.customer?.phone && <div className="text-gray-500">{invoice.customer.phone}</div>}
            </div>
            <div className="space-y-2 text-right">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Issue Date</div>
                <div>{new Date(invoice.createdAt).toLocaleDateString()}</div>
              </div>
              {invoice.dueDate && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Due Date</div>
                  <div className={invoice.status === "overdue" ? "text-red-600 font-semibold" : ""}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Paid On</div>
                  <div className="text-green-700 font-semibold">{new Date(invoice.paidAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Line items (if order linked) */}
          {items.length > 0 && (
            <table className="mb-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Item</th>
                  <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Qty</th>
                  <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Unit Price</th>
                  <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-800">{item.product?.name ?? `Product #${item.id}`}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{item.unitPrice}</td>
                    <td className="py-2 text-right font-semibold">{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-56">
              <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{invoice.amount}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-gray-700">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Notes</div>
              <p>{invoice.notes}</p>
            </div>
          )}

          <div className="mt-10 text-center text-[11px] text-gray-400">
            Thank you for your business.
          </div>
        </div>
      </div>
    </div>
  );
}
