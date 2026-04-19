"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";

export function CustomerPaymentsPage() {
  return (
    <SimpleCrudPage
      title="Customer Payments"
      subtitle="Payments received from customers"
      resource="customer-payments"
      createTitle="New Payment"
      listTitle="Customer Payments"
      enableRowDetails
      detailsTitle={(row) => `Payment #${row.id}`}
      detailsFields={[
        { name: "code", label: "Code" },
        { name: "amount", label: "Amount" },
        { name: "method", label: "Method" },
        { name: "status", label: "Status" },
        { name: "paidAt", label: "Paid At", format: (v) => v ? new Date(String(v)).toLocaleString() : "" },
        { name: "notes", label: "Notes" },
        { name: "createdAt", label: "Created", format: (v) => v ? new Date(String(v)).toLocaleString() : "" },
      ]}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "PAY-001" },
        {
          name: "customerId",
          label: "Customer",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "customers",
            valueField: "id",
            label: (r) => `${r.name}${r.lastName ? " " + r.lastName : ""}`,
          },
        },
        { name: "invoiceId", label: "Invoice ID (optional)", type: "number" },
        { name: "amount", label: "Amount", type: "money" },
        {
          name: "method",
          label: "Payment Method",
          type: "select",
          options: [
            { label: "Cash", value: "cash" },
            { label: "Card", value: "card" },
            { label: "Bank", value: "bank" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
            { label: "Refunded", value: "refunded" },
            { label: "Failed", value: "failed" },
          ],
        },
        { name: "paidAt", label: "Paid At", type: "datetime" },
        { name: "notes", label: "Notes", type: "text" },
      ]}
    />
  );
}
