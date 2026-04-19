"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function AdjustmentsPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.adjustments.title")}
      subtitle={t("pages.adjustments.subtitle")}
      resource="adjustments"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "related_type",
          label: "Related type",
          type: "select",
          options: [
            { label: "order", value: "order" },
            { label: "payment", value: "payment" },
            { label: "expense", value: "expense" },
          ],
        },
        { name: "related_id", label: "Related id", type: "number" },
        { name: "amount", label: "Amount (+/-)", type: "money" },
        { name: "reason", label: "Reason", type: "text" },
      ]}
    />
  );
}
