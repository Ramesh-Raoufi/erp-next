"use client";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { useTranslation } from "react-i18next";

export function TransfersPage() {
  const { t } = useTranslation();
  return (
    <SimpleCrudPage
      title={t("pages.transfers.title")}
      subtitle={t("pages.transfers.subtitle")}
      resource="transfers"
      createTitle={t("crud.createTitle")}
      listTitle={t("crud.listTitle")}
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "order_summary",
          label: "Order",
          type: "text",
          hideInCreate: true,
          hideInEdit: true,
        },
        {
          name: "origin_location",
          label: "Origin",
          type: "text",
          hideInCreate: true,
          hideInEdit: true,
        },
        {
          name: "location",
          label: "Location",
          type: "text",
          hideInCreate: true,
          hideInEdit: true,
        },
        {
          name: "driver_label",
          label: "Driver",
          type: "text",
          hideInCreate: true,
          hideInEdit: true,
        },
        {
          name: "order_id",
          label: "Order",
          type: "select",
          valueType: "number",
          hideInTable: true,
          optionsFrom: {
            resource: "orders",
            valueField: "id",
            label: (row) => {
              const code = row.code
                ? String(row.code)
                : row.id
                  ? String(row.id)
                  : "";
              const customer = row.customer as
                | { name?: unknown; lastName?: unknown }
                | undefined;
              const name = customer?.name ? String(customer.name) : "";
              const lastName = customer?.lastName
                ? String(customer.lastName)
                : "";
              const origin = row.origin ? String(row.origin) : "";
              const destination = row.destination
                ? String(row.destination)
                : "";
              const fullName = `${name} ${lastName}`.trim();
              const route = `${origin} → ${destination}`.trim();
              return `(${code}) - ${fullName} - ${route}`.trim();
            },
          },
        },
        {
          name: "driver_id",
          label: "Driver (optional)",
          type: "select",
          valueType: "number",
          hideInTable: true,
          optionsFrom: {
            resource: "drivers",
            valueField: "id",
            label: (row) => {
              const code = row.code
                ? String(row.code)
                : row.id
                  ? String(row.id)
                  : "";
              const name = row.name ? String(row.name) : "";
              return `(${code}) ${name}`.trim();
            },
          },
        },
        {
          name: "vehicle_info",
          label: "Vehicle info",
          type: "text",
          hideInTable: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "assigned", value: "assigned" },
            { label: "in_transit", value: "in_transit" },
            { label: "completed", value: "completed" },
          ],
        },
        { name: "shipped_at", label: "Shipped at", type: "datetime" },
        { name: "delivered_at", label: "Delivered at", type: "datetime" },
      ]}
    />
  );
}
