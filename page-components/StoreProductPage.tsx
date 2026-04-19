"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { api, type StoreProduct } from "@/lib/api";
import { formatCurrency, parsePrice } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function StoreProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.store.getProduct(Number(id));
        if (!active) return;
        setProduct(data);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <StoreLayout>
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="h-64 animate-pulse rounded-3xl bg-[color:var(--store-mist)]" />
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
          <h1 className="store-font-display text-3xl font-semibold">
            Product not found
          </h1>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-[color:var(--store-forest)] px-6 py-3 text-sm font-semibold text-white"
          >
            Return to shop
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const price = parsePrice(product.price);
  const compareAt = parsePrice(product.compareAtPrice ?? null);

  return (
    <StoreLayout>
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
            <img
              src={
                product.imageUrl ||
                "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop"
              }
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                {product.category || "Marketplace"}
              </div>
              <h1 className="store-font-display mt-3 text-4xl font-semibold">
                {product.name}
              </h1>
              <p className="mt-4 text-sm text-[color:var(--store-forest)]/70">
                {product.description ||
                  "A signature staple crafted for everyday rituals. Small batch, quietly bold."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-2xl font-semibold text-[color:var(--store-ink)]">
                {formatCurrency(price)}
              </div>
              {compareAt > price ? (
                <div className="text-sm text-[color:var(--store-clay)] line-through">
                  {formatCurrency(compareAt)}
                </div>
              ) : null}
              <div className="rounded-full border border-[color:var(--store-forest)]/30 px-3 py-1 text-xs text-[color:var(--store-forest)]/80">
                {product.quantity > 0 ? "In stock" : "Sold out"}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[color:var(--store-forest)] text-white hover:bg-[color:var(--store-olive)]"
                onClick={() =>
                  addItem(
                    {
                      productId: product.id,
                      name: product.name,
                      price,
                      compareAtPrice: compareAt > 0 ? compareAt : null,
                      imageUrl: product.imageUrl
                    },
                    1,
                  )
                }
                disabled={product.quantity <= 0}
              >
                Add to cart
              </Button>
              <Link
                href="/checkout"
                className="rounded-full border border-[color:var(--store-forest)]/40 px-6 py-2 text-sm font-semibold text-[color:var(--store-forest)] transition hover:bg-white"
              >
                Checkout now
              </Link>
            </div>

            <div className="grid gap-4 rounded-2xl border border-black/10 bg-white/70 p-5 text-sm text-[color:var(--store-forest)]/70">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                  Delivery
                </div>
                <div className="mt-2">
                  Scheduled in 48 hours · Carbon-neutral drop-off
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                  Care
                </div>
                <div className="mt-2">
                  Store in a cool, dry place and enjoy within 3 months.
                </div>
              </div>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-[color:var(--store-forest)]"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
