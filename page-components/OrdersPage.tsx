"use client";
import { useEffect, useMemo, useState } from "react";
import { SimpleCrudPage } from "@/components/SimpleCrudPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

export function OrdersPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: string;
      unitPrice: string;
      unitMeasureId: string;
    }>
  >([{ productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" }]);

  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<Record<string, unknown>[]>(
    [],
  );
  const statusOptions = useMemo(
    () => [
      { label: t("pages.orders.status.pending"), value: "pending" },
      { label: t("pages.orders.status.shipped"), value: "shipped" },
      { label: t("pages.orders.status.delivered"), value: "delivered" },
      { label: t("pages.orders.status.cancelled"), value: "cancelled" },
    ],
    [t],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      const [customersList, productsList, unitMeasuresList] = await Promise.all(
        [
          api.list<Record<string, unknown>>("customers"),
          api.list<Record<string, unknown>>("products"),
          api.list<Record<string, unknown>>("unit-measures"),
        ],
      );
      if (!active) return;
      setCustomers(customersList);
      setProducts(productsList);
      setUnitMeasures(unitMeasuresList);
      if (!customerId && customersList[0]?.id != null) {
        setCustomerId(String(customersList[0].id));
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [customerId]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const totalPriceText = useMemo(() => totalPrice.toFixed(2), [totalPrice]);

  function updateItem(
    index: number,
    patch: Partial<{
      productId: string;
      quantity: string;
      unitPrice: string;
      unitMeasureId: string;
    }>,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate() {
    const showError = (message: string) => {
      toast({ variant: "error", message });
    };
    const itemPayload = items
      .map((item) => ({
        product_id: Number(item.productId),
        quantity: Number(item.quantity),
        unit_price: item.unitPrice,
        unit_measure_id: item.unitMeasureId
          ? Number(item.unitMeasureId)
          : undefined,
      }))
      .filter(
        (item) => Number.isFinite(item.product_id) && item.product_id > 0,
      );

    if (!customerId) {
      showError("Select a customer.");
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      showError("Origin and destination are required.");
      return;
    }
    if (itemPayload.length === 0) {
      showError("Add at least one order item.");
      return;
    }
    if (
      itemPayload.some((i) => !Number.isFinite(i.quantity) || i.quantity <= 0)
    ) {
      showError("Each item must have a quantity > 0.");
      return;
    }
    if (
      itemPayload.some(
        (i) =>
          !Number.isFinite(Number(i.unit_price)) || Number(i.unit_price) <= 0,
      )
    ) {
      showError("Each item must have a unit price > 0.");
      return;
    }
    if (itemPayload.some((i) => !i.unit_measure_id || i.unit_measure_id <= 0)) {
      showError("Each item must have a unit measure.");
      return;
    }

    setLoading(true);
    try {
      await api.create("orders", {
        code: code.trim() || undefined,
        customer_id: Number(customerId),
        origin: origin.trim(),
        destination: destination.trim(),
        status,
        items: itemPayload,
      });
      setCode("");
      setOrigin("");
      setDestination("");
      setStatus("pending");
      setItems([
        { productId: "", quantity: "1", unitPrice: "", unitMeasureId: "" },
      ]);
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
      title={t("pages.orders.title")}
      subtitle={t("pages.orders.subtitle")}
      resource="orders"
      refreshKey={refreshKey}
      listTitle={t("crud.listTitle")}
      renderCreate={
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
          <div className="text-sm font-semibold">
            {t("pages.orders.form.new")}
          </div>

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
                {t("fields.customer")}
              </div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
              >
                <option value="">
                  {t("pages.orders.form.customerPlaceholder")}
                </option>
                {customers.map((customer) => {
                  const id = customer.id == null ? "" : String(customer.id);
                  const codeValue = customer.code ? String(customer.code) : "";
                  const name = customer.name ? String(customer.name) : "";
                  const lastName = customer.lastName
                    ? String(customer.lastName)
                    : "";
                  return (
                    <option key={id} value={id}>
                      {`${codeValue} - ${name} ${lastName}`.trim()}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.origin")}
              </div>
              <Input
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.destination")}
              </div>
              <Input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.status")}
              </div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <div className="text-xs text-muted-foreground">
                {t("fields.totalPrice")}
              </div>
              <Input value={totalPriceText} disabled />
            </label>
          </div>

          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold">
                {t("pages.orders.form.itemsTitle")}
              </div>
              <Button variant="outline" size="sm" onClick={addItem}>
                {t("pages.orders.form.addItem")}
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => {
                const lineTotal =
                  Number(item.quantity) && Number(item.unitPrice)
                    ? (Number(item.quantity) * Number(item.unitPrice)).toFixed(
                        2,
                      )
                    : "0.00";
                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-y-3 md:grid-cols-7 md:gap-x-0"
                  >
                    <label className="block space-y-1 md:col-span-2">
                      <div className="text-xs text-muted-foreground">
                        {t("fields.product", { defaultValue: "Product" })}
                      </div>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={item.productId}
                        onChange={(event) => {
                          const nextId = event.target.value;
                          const product = products.find(
                            (p) => String(p.id) === nextId,
                          );
                          const productUnit = product?.unitMeasureId
                            ? String(product.unitMeasureId)
                            : "";
                          updateItem(index, {
                            productId: nextId,
                            ...(productUnit
                              ? { unitMeasureId: productUnit }
                              : {}),
                          });
                        }}
                      >
                        <option value="">{t("common.select")}</option>
                        {products.map((product) => {
                          const id = product.id == null ? "" : String(product.id);
                          const codeValue = product.code
                            ? String(product.code)
                            : "";
                          const name = product.name ? String(product.name) : "";
                          return (
                            <option key={id} value={id}>
                              {`(${codeValue}) ${name}`.trim()}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {t("fields.unitMeasure", { defaultValue: "Unit" })}
                      </div>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={item.unitMeasureId}
                        onChange={(event) =>
                          updateItem(index, {
                            unitMeasureId: event.target.value,
                          })
                        }
                      >
                        <option value="">{t("common.select")}</option>
                        {unitMeasures.map((unit) => {
                          const id = unit.id == null ? "" : String(unit.id);
                          const codeValue = unit.code ? String(unit.code) : "";
                          const nameValue = unit.name ? String(unit.name) : "";
                          return (
                            <option key={id} value={id}>
                              {`${codeValue ? `${codeValue} - ` : ""}${nameValue}`.trim()}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {t("fields.quantity")}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, { quantity: event.target.value })
                        }
                      />
                    </label>
                    <label className="block space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {t("fields.unitPrice", { defaultValue: "Unit price" })}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          updateItem(index, { unitPrice: event.target.value })
                        }
                      />
                    </label>
                    <label className="block space-y-1">
                      <div className="text-xs text-muted-foreground">
                        {t("fields.lineTotal", { defaultValue: "Line total" })}
                      </div>
                      <Input value={lineTotal} disabled />
                    </label>
                    <div className="flex items-end md:justify-end">
                      {items.length > 1 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          {t("pages.orders.form.remove")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-start">
            <Button onClick={handleCreate} disabled={loading}>
              {loading
                ? t("pages.orders.form.submitting")
                : t("pages.orders.form.submit")}
            </Button>
          </div>
        </div>
      }
      fields={[
        { name: "code", label: "Code", type: "text", placeholder: "00001" },
        {
          name: "customer_id",
          label: "Customer",
          type: "select",
          valueType: "number",
          optionsFrom: {
            resource: "customers",
            valueField: "id",
            label: (row) => {
              const code = row.code ? String(row.code) : "";
              const name = row.name ? String(row.name) : "";
              const lastName = row.lastName ? String(row.lastName) : "";
              return `${code} - ${name} ${lastName}`.trim();
            },
          },
        },
        { name: "origin", label: "Origin", type: "text" },
        { name: "destination", label: "Destination", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: statusOptions,
        },
        {
          name: "total_price",
          label: "Total price",
          type: "money",
          hideInEdit: true,
        },
      ]}
    />
  );
}
