"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/store";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const paymentOptions = [
  { label: "Cash on delivery", value: "cash" },
  { label: "Card on file", value: "card" },
  { label: "Bank transfer", value: "bank" }
];

export function StoreCheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "United States",
    paymentMethod: "cash"
  });

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError(null);
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!form.address1.trim() || !form.city.trim() || !form.country.trim()) {
      setError("Complete the shipping address.");
      return;
    }

    setLoading(true);
    try {
      const order = await api.store.createOrder({
        customer: {
          name: form.name.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined
        },
        shipping: {
          address1: form.address1.trim(),
          address2: form.address2.trim() || undefined,
          city: form.city.trim(),
          region: form.region.trim() || undefined,
          postalCode: form.postalCode.trim() || undefined,
          country: form.country.trim()
        },
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity
        })),
        payment_method: form.paymentMethod as "cash" | "card" | "bank"
      });
      clear();
      router.push(`/order/${order.id}?code=${order.code ?? ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <StoreLayout>
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Checkout
            </div>
            <h1 className="store-font-display text-3xl font-semibold">
              Shipping details
            </h1>
          </div>
          <Link
            href="/cart"
            className="text-sm font-semibold text-[color:var(--store-forest)]"
          >
            Back to cart
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="First name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
              <Input
                placeholder="Address line 1"
                value={form.address1}
                onChange={(event) => updateField("address1", event.target.value)}
              />
              <Input
                placeholder="Address line 2"
                value={form.address2}
                onChange={(event) => updateField("address2", event.target.value)}
              />
              <Input
                placeholder="City"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
              <Input
                placeholder="State / Region"
                value={form.region}
                onChange={(event) => updateField("region", event.target.value)}
              />
              <Input
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(event) => updateField("postalCode", event.target.value)}
              />
              <Input
                placeholder="Country"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
              />
            </div>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                Payment
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("paymentMethod", opt.value)}
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${
                      form.paymentMethod === opt.value
                        ? "border-[color:var(--store-forest)] bg-[color:var(--store-sage)] text-[color:var(--store-ink)]"
                        : "border-black/10 bg-white text-[color:var(--store-forest)]/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-[color:var(--store-clay)]/40 bg-[color:var(--store-clay)]/10 px-4 py-3 text-sm text-[color:var(--store-clay)]">
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              <Button
                className="w-full bg-[color:var(--store-forest)] text-white hover:bg-[color:var(--store-olive)]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/70 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Order summary
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-[color:var(--store-forest)]/70">
                      Qty {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-black/10 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Items ({itemCount})</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[color:var(--store-forest)]/70">
                <span>Delivery</span>
                <span>Calculated after order</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
