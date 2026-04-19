"use client";
import { useEffect, useMemo, useState } from "react";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

type UnitMeasureRow = {
  id: number;
  code?: string | null;
  name: string;
  symbol?: string | null;
  baseUnitId?: number | null;
  factor?: string | number | null;
};

type RelatedUnitDraft = {
  code: string;
  name: string;
  symbol: string;
  factor: string;
};

export function UnitMeasuresPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [baseUnitId, setBaseUnitId] = useState("");
  const [factor, setFactor] = useState("");
  const [relatedUnits, setRelatedUnits] = useState<RelatedUnitDraft[]>([]);

  const [units, setUnits] = useState<UnitMeasureRow[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const list = await api.list<UnitMeasureRow>("unit-measures");
      if (!active) return;
      setUnits(list);
    }
    void load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const unitOptions = useMemo(
    () =>
      units.map((unit) => ({
        value: unit.id == null ? "" : String(unit.id),
        label: `${unit.code ? `${unit.code} - ` : ""}${unit.name}`.trim(),
      })),
    [units],
  );

  function addRelatedUnit() {
    setRelatedUnits((prev) => [
      ...prev,
      { code: "", name: "", symbol: "", factor: "" },
    ]);
  }

  function updateRelatedUnit(index: number, patch: Partial<RelatedUnitDraft>) {
    setRelatedUnits((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeRelatedUnit(index: number) {
    setRelatedUnits((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    const showError = (message: string) => {
      toast({ variant: "error", message });
    };
    if (!name.trim()) {
      showError(t("pages.unitMeasures.form.errors.nameRequired"));
      return;
    }

    if (baseUnitId && (!factor || Number(factor) <= 0)) {
      showError(t("pages.unitMeasures.form.errors.factorRequired"));
      return;
    }

    if (baseUnitId && relatedUnits.length > 0) {
      showError(t("pages.unitMeasures.form.errors.relatedForBaseOnly"));
      return;
    }

    const relatedPayload = relatedUnits
      .map((unit) => ({
        code: unit.code.trim() || undefined,
        name: unit.name.trim(),
        symbol: unit.symbol.trim() || undefined,
        factor: unit.factor,
      }))
      .filter((unit) => unit.name && Number(unit.factor) > 0);

    if (
      relatedUnits.length > 0 &&
      relatedPayload.length !== relatedUnits.length
    ) {
      showError(t("pages.unitMeasures.form.errors.eachRelatedNeeds"));
      return;
    }

    setLoading(true);
    try {
      await api.create("unit-measures", {
        code: code.trim() || undefined,
        name: name.trim(),
        symbol: symbol.trim() || undefined,
        base_unit_id: baseUnitId ? Number(baseUnitId) : undefined,
        factor: factor ? Number(factor) : undefined,
        related_units: relatedPayload.length ? relatedPayload : undefined,
      });
      setCode("");
      setName("");
      setSymbol("");
      setBaseUnitId("");
      setFactor("");
      setRelatedUnits([]);
      setRefreshKey((k) => k + 1);
      toast({
        variant: "success",
        message: t("crud.createSuccess", {
          defaultValue: "Created successfully",
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Create failed";
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SimpleCrudPage
      title={t("pages.unitMeasures.title")}
      subtitle={t("pages.unitMeasures.subtitle")}
      resource="unit-measures"
      refreshKey={refreshKey}
      listTitle={t("crud.listTitle")}
      renderCreate={
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
          <div className="text-sm font-semibold">{t("crud.createTitle")}</div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.code")}
              </div>
              <Input
                placeholder="00001"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.name")}
              </div>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.symbol")}
              </div>
              <Input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.baseUnit")} ({t("common.optional")})
              </div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={baseUnitId}
                onChange={(event) => setBaseUnitId(event.target.value)}
              >
                <option value="">
                  {t("pages.unitMeasures.form.baseUnitNone")}
                </option>
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.factor")}
              </div>
              <Input
                type="number"
                min={0}
                step="0.0001"
                value={factor}
                onChange={(event) => setFactor(event.target.value)}
                placeholder="e.g. 1000"
              />
            </label>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold">
                {t("pages.unitMeasures.form.relatedUnitsTitle")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addRelatedUnit}
                disabled={!!baseUnitId}
              >
                {t("pages.unitMeasures.form.addRelatedUnit")}
              </Button>
            </div>
            {baseUnitId ? (
              <div className="text-xs text-muted-foreground">
                {t("pages.unitMeasures.form.relatedUnitsBaseOnly")}
              </div>
            ) : null}
            <div className="space-y-3">
              {relatedUnits.map((unit, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 md:grid-cols-5"
                >
                  <label className="block space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {t("fields.code")}
                    </div>
                    <Input
                      value={unit.code}
                      onChange={(event) =>
                        updateRelatedUnit(index, { code: event.target.value })
                      }
                    />
                  </label>
                  <label className="block space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {t("fields.name")}
                    </div>
                    <Input
                      value={unit.name}
                      onChange={(event) =>
                        updateRelatedUnit(index, { name: event.target.value })
                      }
                    />
                  </label>
                  <label className="block space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {t("fields.symbol")}
                    </div>
                    <Input
                      value={unit.symbol}
                      onChange={(event) =>
                        updateRelatedUnit(index, { symbol: event.target.value })
                      }
                    />
                  </label>
                  <label className="block space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {t("fields.factor")}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step="0.0001"
                      value={unit.factor}
                      onChange={(event) =>
                        updateRelatedUnit(index, { factor: event.target.value })
                      }
                    />
                  </label>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRelatedUnit(index)}
                    >
                      {t("pages.unitMeasures.form.remove")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start">
            <Button onClick={handleCreate} disabled={loading}>
              {loading
                ? t("pages.unitMeasures.form.submitting")
                : t("pages.unitMeasures.form.submit")}
            </Button>
          </div>
        </div>
      }
      fields={[
        {
          name: "code",
          label: t("fields.code"),
          type: "text",
          placeholder: "00001",
        },
        { name: "name", label: t("fields.name"), type: "text" },
        { name: "symbol", label: t("fields.symbol"), type: "text" },
        {
          name: "base_unit_id",
          label: t("fields.baseUnit"),
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "unit-measures",
            valueField: "id",
            label: (row) => {
              const codeValue = row.code ? String(row.code) : "";
              const nameValue = row.name ? String(row.name) : "";
              return `${codeValue ? `${codeValue} - ` : ""}${nameValue}`.trim();
            },
          },
        },
        { name: "factor", label: t("fields.factor"), type: "number" },
      ]}
    />
  );
}
