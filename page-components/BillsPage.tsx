"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";

export function BillsPage() {
  return (
    <SimpleCrudPage
      title="Bills"
      subtitle="Bills to pay to vendors"
      resource="bills"
      createTitle="New Bill"
      listTitle="Bills"
      enableRowDetails
      detailsTitle={(row) => `Bill #${row.id}`}
      detailsFields={[
        { name: "code", label: "Code" },
        { name: "amount", label: "Amount" },
        { name: "status", label: "Status" },
        { name: "dueDate", label: "Due Date", format: (v) => v ? new Date(String(v)).toLocaleDateString() : "" },
        { name: "description", label: "Description" },
        { name: "createdAt", label: "Created", format: (v) => v ? new Date(String(v)).toLocaleString() : "" },
      ]}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "BILL-001" },
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
        { name: "amount", label: "Amount", type: "money" },
        { name: "dueDate", label: "Due Date", type: "datetime" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Overdue", value: "overdue" },
          ],
        },
        { name: "description", label: "Description", type: "text" },
      ]}
    />
  );
}
