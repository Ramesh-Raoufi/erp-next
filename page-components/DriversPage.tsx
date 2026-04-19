"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function DriversPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.drivers.title")}
      subtitle={t("pages.drivers.subtitle")}
      resource="drivers"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        { name: "name", label: "Name", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "license_number", label: "License number", type: "text" },
        { name: "vehicle_type", label: "Vehicle type", type: "text" },
      ]}
    />
  );
}
