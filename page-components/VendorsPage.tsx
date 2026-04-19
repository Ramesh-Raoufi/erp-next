"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";

export function VendorsPage() {
  return (
    <SimpleCrudPage
      title="Vendors"
      subtitle="Manage your suppliers and vendors"
      resource="vendors"
      createTitle="New Vendor"
      listTitle="Vendors"
      enableRowDetails
      detailsTitle={(row) => `Vendor #${row.id} — ${row.name}`}
      detailsFields={[
        { name: "code", label: "Code" },
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "address", label: "Address" },
        { name: "createdAt", label: "Created", format: (v) => v ? new Date(String(v)).toLocaleString() : "" },
      ]}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "VND-001" },
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "address", label: "Address", type: "text" },
      ]}
    />
  );
}
