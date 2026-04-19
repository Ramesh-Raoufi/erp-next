"use client";
import { SimpleCrudPage, type DetailField } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function AccountsPage() {
  const { t } = useTranslation();
  const details: DetailField[] = [
    { name: "code", label: "Code" },
    { name: "name", label: "Name" },
    { name: "accountTypeId", label: "Account type" },
    { name: "balance", label: "Balance" },
    { name: "description", label: "Description" },
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
      title={t("pages.accounts.title")}
      subtitle={t("pages.accounts.subtitle")}
      resource="accounts"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      enableRowDetails
      detailsTitle={(row) => `Account #${row.id}`}
      detailsFields={details}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        { name: "name", label: "Name", type: "text" },
        {
          name: "accountTypeId",
          label: "Account type",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "account-types",
            valueField: "id",
            label: (row) => {
              const code = row.code ? String(row.code) : "";
              const name = row.name ? String(row.name) : "";
              return `${code} ${name}`.trim() || String(row.id ?? "");
            },
          },
        },
        { name: "balance", label: "Balance", type: "money" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
