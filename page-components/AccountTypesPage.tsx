"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function AccountTypesPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.accountTypes.title")}
      subtitle={t("pages.accountTypes.subtitle")}
      resource="account-types"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        { name: "name", label: "Name", type: "text" },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "asset", value: "asset" },
            { label: "liability", value: "liability" },
            { label: "income", value: "income" },
            { label: "expense", value: "expense" },
            { label: "equity", value: "equity" },
          ],
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
