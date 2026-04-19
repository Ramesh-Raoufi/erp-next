"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function TrackingPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.tracking.title")}
      subtitle={t("pages.tracking.subtitle")}
      resource="tracking"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "transfer_id",
          label: "Transfer",
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
        { name: "status", label: "Status", type: "text" },
        { name: "location", label: "Location", type: "text" },
      ]}
    />
  );
}
