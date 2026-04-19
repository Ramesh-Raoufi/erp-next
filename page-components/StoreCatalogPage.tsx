"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { api, type StoreProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { parsePrice } from "@/lib/store";
import { Input } from "@/components/ui/input";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to high", value: "price_asc" },
  { label: "Price: High to low", value: "price_desc" }
];

export function StoreCatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [items, cats] = await Promise.all([
          api.store.listProducts({
            q: query || undefined,
            category: category || undefined,
            sort: sort as "newest" | "price_asc" | "price_desc"
          }),
          api.store.categories()
        ]);
        if (!active) return;
        setProducts(items);
        setCategories(cats);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [query, category, sort]);

  const categoryOptions = useMemo(
    () => ["All", ...(categories.length ? categories : [])],
    [categories],
  );

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (!value || value === "All") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.replace(`/products?${next.toString()}`);
  }

  return (
    <StoreLayout>
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-6 rounded-3xl border border-black/10 bg-white/70 p-6 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Shop
            </div>
            <h1 className="store-font-display mt-2 text-3xl font-semibold">
              Explore the full market
            </h1>
            <p className="mt-2 text-sm text-[color:var(--store-forest)]/70">
              Filter by collection, refine by price, and discover new arrivals.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search by product or category"
              value={query}
              onChange={(event) => updateParam("q", event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category || "All"}
                onChange={(event) =>
                  updateParam("category", event.target.value)
                }
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sort}
                onChange={(event) => updateParam("sort", event.target.value)}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm text-[color:var(--store-forest)]/70">
          <div>{products.length} products</div>
          <div>Updated weekly</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-72 rounded-2xl border border-black/10 bg-white/70 p-4"
              >
                <div className="h-32 w-full animate-pulse rounded-2xl bg-[color:var(--store-mist)]" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[color:var(--store-mist)]" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[color:var(--store-mist)]" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-black/10 bg-white/70 p-10 text-center text-sm text-[color:var(--store-forest)]/70">
              No products match this filter yet. Try another collection.
            </div>
          ) : (
            products.map((product) => {
              const price = parsePrice(product.price);
              const compareAt = parsePrice(product.compareAtPrice ?? null);
              return (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  onAdd={() =>
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
                />
              );
            })
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
