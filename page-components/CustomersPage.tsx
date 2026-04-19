"use client";
import { SimpleCrudPage, type DetailField } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function CustomersPage() {
  const { t } = useTranslation();
  const details: DetailField[] = [
    { name: "code", label: "Code" },
    { name: "name", label: "Name" },
    { name: "lastName", label: "Last name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    {
      name: "createdAt",
      label: "Created",
      format: (value) =>
        value ? new Date(String(value)).toLocaleString() : "",
    },
    {
      name: "updatedAt",
      label: "Updated",
      format: (value) =>
        value ? new Date(String(value)).toLocaleString() : "",
    },
  ];

  return (
    <SimpleCrudPage
      title={t("pages.customers.title")}
      subtitle={t("pages.customers.subtitle")}
      resource="customers"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      enableRowDetails
      detailsTitle={(row) => `Customer #${row.id}`}
      detailsFields={details}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        { name: "name", label: "Name", type: "text" },
        { name: "lastName", label: "Last name", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
      ]}
    />
  );
}
