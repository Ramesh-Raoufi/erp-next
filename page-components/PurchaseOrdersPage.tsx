"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";

export function PurchaseOrdersPage() {
  return (
    <SimpleCrudPage
      title="Purchase Orders"
      subtitle="Orders placed to vendors"
      resource="purchase-orders"
      createTitle="New Purchase Order"
      listTitle="Purchase Orders"
      enableRowDetails
      detailsTitle={(row) => `PO #${row.id}`}
      detailsFields={[
        { name: "code", label: "Code" },
        { name: "status", label: "Status" },
        { name: "totalAmount", label: "Total Amount" },
        { name: "expectedAt", label: "Expected", format: (v) => v ? new Date(String(v)).toLocaleDateString() : "" },
        { name: "notes", label: "Notes" },
        { name: "createdAt", label: "Created", format: (v) => v ? new Date(String(v)).toLocaleString() : "" },
      ]}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "PO-001" },
        {
          name: "vendorId",
          label: "Vendor",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "vendors",
            valueField: "id",
            label: (r) => `${r.name}`,
          },
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Sent", value: "sent" },
            { label: "Received", value: "received" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
        { name: "totalAmount", label: "Total Amount", type: "money" },
        { name: "expectedAt", label: "Expected Date", type: "datetime" },
        { name: "notes", label: "Notes", type: "text" },
      ]}
    />
  );
}
