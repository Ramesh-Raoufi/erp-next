"use client";
import Link from "next/link";
import { StoreLayout } from "@/components/store/StoreLayout";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StoreCartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <StoreLayout>
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Cart
            </div>
            <h1 className="store-font-display text-3xl font-semibold">
              Review your selections
            </h1>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[color:var(--store-forest)]"
          >
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-10 text-center">
            <p className="text-sm text-[color:var(--store-forest)]/70">
              Your cart is empty. Start with a curated bundle.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-[color:var(--store-forest)] px-6 py-3 text-sm font-semibold text-white"
            >
              Shop products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=400&auto=format&fit=crop"
                      }
                      alt={item.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="store-font-display text-lg font-semibold">
                        {item.name}
                      </div>
                      <div className="text-sm text-[color:var(--store-forest)]/70">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(
                          item.productId,
                          Math.max(1, Number(event.target.value) || 1),
                        )
                      }
                      className="w-20"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                Summary
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-[color:var(--store-forest)]/70">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-6">
                <Link
                  href="/checkout"
                  className="block rounded-full bg-[color:var(--store-forest)] px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Proceed to checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </StoreLayout>
  );
}
