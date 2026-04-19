"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function ProductsPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.products.title")}
      subtitle={t("pages.products.subtitle")}
      resource="products"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        { name: "name", label: "Name", type: "text" },
        { name: "price", label: "Price", type: "money" },
        { name: "compare_at_price", label: "Compare at", type: "money" },
        { name: "category", label: "Category", type: "text" },
        {
          name: "image_url",
          label: "Image",
          type: "file",
          hideInTable: true
        },
        { name: "weight", label: "Weight", type: "number" },
        { name: "quantity", label: "Quantity", type: "number" },
        {
          name: "unit_measure_id",
          label: t("fields.unitMeasure"),
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "unit-measures",
            valueField: "id",
            label: (row) => {
              const code = row.code ? String(row.code) : "";
              const name = row.name ? String(row.name) : "";
              return `${code ? `${code} - ` : ""}${name}`.trim();
            },
          },
        },
        {
          name: "is_active",
          label: "Active",
          type: "select",
          options: [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" }
          ]
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
