"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function ExpensesPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.expenses.title")}
      subtitle={t("pages.expenses.subtitle")}
      resource="expenses"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "shipment", value: "shipment" },
            { label: "general", value: "general" },
          ],
        },
        {
          name: "reference_id",
          label: "Transfer (shipment only)",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "transfers",
            valueField: "id",
            label: (row) => {
              const code = row.code
                ? String(row.code)
                : row.id
                  ? String(row.id)
                  : "";
              const status = row.status ? String(row.status) : "";
              return `(${code}) ${status}`.trim();
            },
          },
        },
        { name: "amount", label: "Amount", type: "money" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "fuel", value: "fuel" },
            { label: "rent", value: "rent" },
            { label: "salary", value: "salary" },
            { label: "maintenance", value: "maintenance" },
            { label: "office", value: "office" },
          ],
        },
        { name: "description", label: "Description", type: "textarea" },
        { name: "paid_at", label: "Paid at", type: "datetime" },
      ]}
    />
  );
}
