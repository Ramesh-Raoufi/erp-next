"use client";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { Field, type FieldDef } from "@/components/Field";
import { api, type CrudResource } from "@/lib/api";
import { useTranslation } from "react-i18next";

export type DetailField = {
  name: string;
  label: string;
  format?: (value: unknown, row: Record<string, unknown>) => string;
};

function toIsoIfDatetime(def: FieldDef, value: string): string | undefined {
  if (!value) return undefined;
  if (def.type !== "datetime") return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function buildBody(fields: FieldDef[], form: Record<string, string>) {
  const body: Record<string, unknown> = {};
  for (const def of fields) {
    const raw = form[def.name] ?? "";
    if (raw === "") {
      if (def.type === "file") {
        body[def.name] = null;
      }
      continue;
    }

    if (def.type === "number") {
      const n = Number(raw);
      if (!Number.isNaN(n)) body[def.name] = n;
      continue;
    }
    if (def.type === "select" && def.valueType === "number") {
      const n = Number(raw);
      if (!Number.isNaN(n)) body[def.name] = n;
      continue;
    }
    if (def.type === "money") {
      body[def.name] = raw;
      continue;
    }
    if (def.type === "datetime") {
      const iso = toIsoIfDatetime(def, raw);
      if (iso) body[def.name] = iso;
      continue;
    }

    body[def.name] = raw;
  }
  return body;
}

export function SimpleCrudPage({
  title,
  subtitle,
  resource,
  fields,
  idField = "id",
  enableRowDetails = true,
  detailsTitle,
  detailsFields,
  hideCreate = false,
  refreshKey,
  createTitle,
  submitLabel,
  listTitle,
  showHeader = true,
  renderCreate,
}: {
  title: string;
  subtitle?: string;
  resource: CrudResource;
  fields: FieldDef[];
  idField?: string;
  enableRowDetails?: boolean;
  detailsTitle?: string | ((row: Record<string, unknown>) => string);
  detailsFields?: DetailField[];
  hideCreate?: boolean;
  refreshKey?: number;
  createTitle?: string;
  submitLabel?: string;
  listTitle?: string;
  showHeader?: boolean;
  renderCreate?: ReactNode;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >({});

  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRtl = i18n.dir(i18n.language) === "rtl";
  const createTitleText = createTitle ?? t("crud.createTitle");
  const submitLabelText = submitLabel ?? t("crud.submit");
  const showListTitle = listTitle != null;
  const listTitleText = showListTitle ? (listTitle ?? t("crud.listTitle")) : "";
  const clickRowLabel = t("crud.clickRow");
  const noRecordsLabel = t("crud.noRecords");
  const refreshLabel = t("crud.refresh");
  const editLabel = t("crud.edit");
  const deleteLabel = t("crud.delete");
  const cancelLabel = t("crud.cancel");
  const saveLabel = t("crud.save");
  const numberLabel = t("crud.number");
  const loadFailedLabel = t("crud.loadFailed", { defaultValue: "Load failed" });
  const createSuccessLabel = t("crud.createSuccess", {
    defaultValue: "Created successfully",
  });
  const updateSuccessLabel = t("crud.updateSuccess", {
    defaultValue: "Updated successfully",
  });
  const deleteSuccessLabel = t("crud.deleteSuccess", {
    defaultValue: "Deleted successfully",
  });
  const createFailedLabel = t("crud.createFailed", {
    defaultValue: "Create failed",
  });
  const updateFailedLabel = t("crud.updateFailed", {
    defaultValue: "Update failed",
  });
  const deleteFailedLabel = t("crud.deleteFailed", {
    defaultValue: "Delete failed",
  });

  const translateFieldLabel = useCallback(
    (name: string, fallback?: string) =>
      t(`fields.${name}`, { defaultValue: fallback ?? name }),
    [t],
  );

  const translatedFields = useMemo(
    () =>
      fields.map((field) => ({
        ...field,
        label: translateFieldLabel(field.name, field.label),
      })),
    [fields, translateFieldLabel],
  );

  const resolvedFields = useMemo(
    () =>
      translatedFields.map((field) =>
        field.optionsFrom
          ? {
              ...field,
              options: dynamicOptions[field.name] ?? [],
            }
          : field,
      ),
    [translatedFields, dynamicOptions],
  );

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      const fieldsWithOptions = fields.filter((f) => f.optionsFrom);
      if (fieldsWithOptions.length === 0) return;

      const results = await Promise.all(
        fieldsWithOptions.map(async (field) => {
          const source = field.optionsFrom!;
          const valueField = source.valueField ?? "id";
          const labelField = source.labelField;
          const rows = await api.list<Record<string, unknown>>(
            source.resource as CrudResource,
          );
          const options = rows.map((row) => {
            const value = row[valueField];
            const label = source.label
              ? source.label(row)
              : labelField
                ? row[labelField]
                : value;
            return {
              value: value == null ? "" : String(value),
              label: label == null ? "" : String(label),
            };
          });
          return [field.name, options] as const;
        }),
      );

      if (!active) return;
      setDynamicOptions((prev) => {
        const next = { ...prev };
        for (const [name, options] of results) {
          next[name] = options;
        }
        return next;
      });
    }

    void loadOptions();
    return () => {
      active = false;
    };
  }, [fields]);

  useEffect(() => {
    setCreating((prev) => {
      const next = { ...prev };
      for (const f of resolvedFields) {
        if (f.type !== "select") continue;
        if (f.hideInCreate) continue;
        const hasValue = next[f.name] != null && next[f.name] !== "";
        if (hasValue) continue;
        const first = f.options?.[0]?.value;
        if (first) next[f.name] = first;
      }
      return next;
    });
  }, [resolvedFields]);

  const columns = useMemo(() => {
    return [
      idField,
      ...resolvedFields.filter((f) => !f.hideInTable).map((f) => f.name),
    ];
  }, [resolvedFields, idField]);

  const createFields = useMemo(
    () => resolvedFields.filter((f) => !f.hideInCreate),
    [resolvedFields],
  );
  const editFields = useMemo(
    () => resolvedFields.filter((f) => !f.hideInEdit),
    [resolvedFields],
  );

  const translatedDetailFields = useMemo(
    () =>
      detailsFields?.map((field) => ({
        ...field,
        label: translateFieldLabel(field.name, field.label),
      })),
    [detailsFields, translateFieldLabel],
  );

  const detailFieldList = useMemo<DetailField[]>(() => {
    if (translatedDetailFields && translatedDetailFields.length)
      return translatedDetailFields;
    const labelMap = new Map(resolvedFields.map((f) => [f.name, f.label]));
    return columns.map((name) => ({
      name,
      label:
        name === idField
          ? translateFieldLabel(name, "ID")
          : (labelMap.get(name) ?? translateFieldLabel(name, name)),
    }));
  }, [
    columns,
    translatedDetailFields,
    resolvedFields,
    idField,
    translateFieldLabel,
  ]);

  const columnLabelMap = useMemo(() => {
    return new Map(resolvedFields.map((f) => [f.name, f.label]));
  }, [resolvedFields]);

  const selectLabelLookup = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    for (const field of resolvedFields) {
      if (field.type !== "select") continue;
      const options = field.options ?? [];
      map.set(
        field.name,
        new Map(options.map((opt) => [String(opt.value), opt.label])),
      );
    }
    return map;
  }, [resolvedFields]);

  function displayValue(fieldName: string, raw: unknown) {
    if (raw == null) return "";
    const lookup = selectLabelLookup.get(fieldName);
    if (lookup) {
      const label = lookup.get(String(raw));
      if (label != null && label !== "") return label;
    }
    return String(raw);
  }

  async function refresh() {
    setLoading(true);
    try {
      const list = await api.list<Record<string, unknown>>(resource);
      setRows(list);
    } catch (e) {
      setRows([]);
      const message = e instanceof Error ? e.message : loadFailedLabel;
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, refreshKey]);

  async function onCreate() {
    try {
      await api.create(resource, buildBody(createFields, creating));
      setCreating({});
      await refresh();
      toast({ variant: "success", message: createSuccessLabel });
    } catch (e) {
      const message = e instanceof Error ? e.message : createFailedLabel;
      toast({ variant: "error", message });
    }
  }

  async function onSave() {
    if (editingId == null) return;
    try {
      await api.update(resource, editingId, buildBody(editFields, editing));
      setEditingId(null);
      setEditing({});
      await refresh();
      toast({ variant: "success", message: updateSuccessLabel });
    } catch (e) {
      const message = e instanceof Error ? e.message : updateFailedLabel;
      toast({ variant: "error", message });
    }
  }

  async function onDelete(id: number) {
    try {
      await api.remove(resource, id);
      await refresh();
      toast({ variant: "success", message: deleteSuccessLabel });
    } catch (e) {
      const message = e instanceof Error ? e.message : deleteFailedLabel;
      toast({ variant: "error", message });
    }
  }

  function startEdit(row: Record<string, unknown>) {
    const id = Number(row[idField]);
    setEditingId(id);
    const next: Record<string, string> = {};
    for (const f of editFields) {
      const v = row[f.name];
      if (v == null) continue;
      next[f.name] = String(v);
    }
    setEditing(next);
  }

  const detailTitleText = detailRow
    ? typeof detailsTitle === "function"
      ? detailsTitle(detailRow)
      : (detailsTitle ?? t("crud.detailsTitle", { title }))
    : t("crud.detailsTitle", { title });

  const detailSubtitle = detailRow
    ? Object.entries(detailRow).find(
        ([key, value]) =>
          ["name", "code", "username", "email"].includes(key) && value,
      )?.[1]
    : "";

  const detailHighlights = detailRow
    ? ["code", "name", "username", "email", "role"]
        .map((key) => ({ key, value: detailRow[key] }))
        .filter(
          (item) => item.value != null && String(item.value).trim() !== "",
        )
    : [];

  const defaultCreatePanel = !hideCreate ? (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="text-sm font-semibold">{createTitleText}</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {createFields.map((f) => (
          <Field
            key={f.name}
            def={f}
            value={creating[f.name] ?? ""}
            onChange={(v) => setCreating((s) => ({ ...s, [f.name]: v }))}
          />
        ))}
      </div>
      <div>
        <Button onClick={onCreate}>{submitLabelText}</Button>
      </div>
    </div>
  ) : null;

  const createPanel = renderCreate ?? defaultCreatePanel;
  const isListFocused = !!detailRow;
  const showCreatePanel = createPanel != null && !isListFocused;
  const showCreateToggle = createPanel != null && isListFocused;

  const listPanel = (
    <div className="space-y-4">
      <div
        className={
          listTitle
            ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            : "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
        }
      >
        {showListTitle ? (
          <div className="text-sm font-semibold">{listTitleText}</div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {showCreateToggle ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailRow(null)}
            >
              {createTitleText}
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={refresh}
            disabled={loading}
            aria-label={refreshLabel}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50/40 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100/70">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className={`px-3 py-2 ${isRtl ? "text-right" : "text-left"} font-semibold whitespace-nowrap`}
                  >
                    {c === idField
                      ? numberLabel
                      : (columnLabelMap.get(c) ?? c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <tr
                      key={`skeleton-${idx}`}
                      className={`border-t ${idx % 2 === 1 ? "bg-blue-50/40" : "bg-white"}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c}
                          className={`px-3 py-2 ${isRtl ? "text-right" : "text-left"}`}
                        >
                          <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row, index) => {
                    const id = Number(row[idField]);
                    const isSelected =
                      detailRow && Number(detailRow[idField]) === id;
                    const rowShade =
                      index % 2 === 1 ? "bg-blue-50/40" : "bg-white";
                    return (
                      <tr
                        key={id}
                        className={
                          enableRowDetails
                            ? `border-t ${rowShade} cursor-pointer hover:bg-blue-100/40${
                                isSelected ? " bg-blue-100/60" : ""
                              }`
                            : `border-t ${rowShade}`
                        }
                        onClick={
                          enableRowDetails
                            ? () => setDetailRow(row)
                            : undefined
                        }
                      >
                        {columns.map((c) => (
                          <td
                            key={c}
                            className={`px-3 py-2 whitespace-nowrap ${
                              isRtl ? "text-right" : "text-left"
                            }`}
                          >
                            {c === idField
                              ? String(index + 1)
                              : displayValue(c, row[c])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

              {!loading && rows.length === 0 ? (
                <tr>
                  <td
                    className={`px-3 py-4 text-muted-foreground ${
                      isRtl ? "text-right" : "text-left"
                    }`}
                    colSpan={columns.length}
                  >
                    {noRecordsLabel}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const detailsPanel = (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">{detailTitleText}</div>
          {detailSubtitle ? (
            <div className="text-sm text-muted-foreground">
              {String(detailSubtitle)}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!detailRow}
            onClick={() => {
              if (!detailRow) return;
              startEdit(detailRow);
            }}
          >
            {editLabel}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!detailRow}
            onClick={() => {
              if (!detailRow) return;
              const id = Number(detailRow[idField]);
              const label = detailTitleText || `${title} #${id}`;
              setConfirmDelete({ id, label });
            }}
          >
            {deleteLabel}
          </Button>
        </div>
      </div>

      {detailRow ? (
        <>
          {detailHighlights.length ? (
            <div className="flex flex-wrap gap-2">
              {detailHighlights.map((item) => (
                <span
                  key={item.key}
                  className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                >
                  {item.key}:{" "}
                  <span className="font-medium text-foreground">
                    {String(item.value)}
                  </span>
                </span>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {detailFieldList.map((field) => {
              const raw = detailRow?.[field.name];
              const value = field.format
                ? field.format(raw, detailRow ?? {})
                : displayValue(field.name, raw);
              return (
                <div key={field.name} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {field.label}
                  </div>
                  <div className="mt-1 text-sm font-medium">{value || "-"}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">{clickRowLabel}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {showHeader ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? (
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showCreatePanel ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-4">{createPanel}</div>
          <div className="space-y-4">{listPanel}</div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          {listPanel}
          {detailsPanel}
        </div>
      )}

      <Drawer
        open={editingId != null}
        onOpenChange={(open) => {
          if (open) return;
          setEditingId(null);
          setEditing({});
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingId != null
                ? t("crud.editHeading", { id: editingId })
                : t("crud.editHeading", { id: "" })}
            </DrawerTitle>
          </DrawerHeader>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {editFields.map((f) => (
              <Field
                key={f.name}
                def={f}
                value={editing[f.name] ?? ""}
                onChange={(v) => setEditing((s) => ({ ...s, [f.name]: v }))}
              />
            ))}
          </div>
          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setEditing({});
              }}
            >
              {cancelLabel}
            </Button>
            <Button onClick={onSave}>{saveLabel}</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("crud.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("crud.confirmDeleteDescription", {
                label: confirmDelete?.label ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDelete) return;
                const { id } = confirmDelete;
                setConfirmDelete(null);
                setDetailRow(null);
                onDelete(id);
              }}
            >
              {deleteLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
