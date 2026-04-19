"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function PaymentsPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.payments.title")}
      subtitle={t("pages.payments.subtitle")}
      resource="payments"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "order_id",
          label: "Order",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "orders",
            valueField: "id",
            label: (row) => {
              const code = row.code
                ? String(row.code)
                : row.id
                  ? String(row.id)
                  : "";
              const origin = row.origin ? String(row.origin) : "";
              const destination = row.destination
                ? String(row.destination)
                : "";
              return `(${code}) ${origin} → ${destination}`.trim();
            },
          },
        },
        { name: "amount", label: "Amount", type: "money" },
        {
          name: "method",
          label: "Method",
          type: "select",
          options: [
            { label: "cash", value: "cash" },
            { label: "card", value: "card" },
            { label: "bank", value: "bank" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "paid", value: "paid" },
            { label: "partial", value: "partial" },
            { label: "unpaid", value: "unpaid" },
          ],
        },
        { name: "paid_at", label: "Paid at", type: "datetime" },
      ]}
    />
  );
}
