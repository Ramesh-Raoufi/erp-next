"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type FieldType =
  | "text"
  | "number"
  | "money"
  | "select"
  | "datetime"
  | "textarea"
  | "password"
  | "file";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  hideInTable?: boolean;
  hideInCreate?: boolean;
  hideInEdit?: boolean;
  valueType?: "string" | "number";
  optionsFrom?: {
    resource: string;
    valueField?: string;
    labelField?: string;
    label?: (row: Record<string, unknown>) => string;
  };
};

export function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block space-y-1">
      <div className="text-xs text-muted-foreground">{def.label}</div>
      {def.type === "select" ? (
        <select
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{t("common.select")}</option>
          {(def.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : def.type === "textarea" ? (
        <textarea
          className={cn(
            "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          value={value}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : def.type === "file" ? (
        <div className="space-y-2">
          {value ? (
            <div className="flex flex-wrap items-center gap-3">
              <img
                src={value}
                alt="Uploaded preview"
                className="h-16 w-16 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-md border px-3 py-1 text-xs text-muted-foreground"
              >
                Clear image
              </button>
            </div>
          ) : null}
          <Input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  onChange(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
          <div className="text-xs text-muted-foreground">
            Image is stored as a data URL. Keep it under 1MB.
          </div>
        </div>
      ) : (
        <Input
          type={
            def.type === "datetime"
              ? "datetime-local"
              : def.type === "number"
                ? "number"
                : def.type === "password"
                  ? "password"
                  : "text"
          }
          value={value}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
