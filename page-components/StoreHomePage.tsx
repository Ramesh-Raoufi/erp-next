"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "@/components/store/StoreLayout";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { api, type StoreProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { parsePrice } from "@/lib/store";

const DEFAULT_CATEGORIES = ["Pantry", "Home", "Wellness", "Garden", "Electronics", "Clothing", "Sports", "Books"];

export function StoreHomePage() {
  const [featured, setFeatured] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [products, cats] = await Promise.all([
          api.store.listProducts({ sort: "newest" }),
          api.store.categories(),
        ]);
        if (!active) return;
        setFeatured(products.slice(0, 6));
        setCategories(cats.slice(0, 8));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <StoreLayout>
      {/* ── HERO ── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-4 md:text-5xl">
            Quality Products,<br />Fast Delivery
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md">
            Curated products from trusted suppliers, delivered to your door within 48 hours.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-blue-600 font-medium hover:underline">
              Shop now →
            </Link>
            <Link href="/products" className="text-blue-600 font-medium hover:underline">
              Browse catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {(categories.length ? categories : DEFAULT_CATEGORIES).map((category, i) => (
              <Link
                key={`${category}-${i}`}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-slate-700 hover:bg-gray-100 transition"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-semibold text-slate-900">Featured</h2>
            <Link href="/products" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-${i}`} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="h-44 w-full animate-pulse bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              : featured.map((product) => {
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
                            imageUrl: product.imageUrl,
                          },
                          1,
                        )
                      }
                    />
                  );
                })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-50 px-6 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ready to shop?</h2>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 text-sm"
          >
            Browse all products
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
}
