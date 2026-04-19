"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "@/components/store/StoreLayout";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { api, type StoreProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { parsePrice } from "@/lib/store";

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
          api.store.categories()
        ]);
        if (!active) return;
        setFeatured(products.slice(0, 6));
        setCategories(cats.slice(0, 6));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <StoreLayout>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--store-mist)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)] animate-rise">
            New seasonal arrivals
          </div>
          <h1 className="store-font-display text-4xl font-semibold leading-tight text-[color:var(--store-ink)] md:text-5xl">
            Curated goods that bring warmth, ritual, and ease to every day.
          </h1>
          <p className="text-base text-[color:var(--store-forest)]/80 md:text-lg">
            Thoughtful staples sourced from small makers and trusted partners.
            Build a pantry and home that feels grounded, refined, and quietly
            bold.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-full bg-[color:var(--store-forest)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[color:var(--store-olive)]"
            >
              Shop the collection
            </Link>
            <Link
              href="/#story"
              className="rounded-full border border-[color:var(--store-forest)]/40 px-6 py-3 text-sm font-semibold text-[color:var(--store-forest)] transition hover:bg-white"
            >
              Our story
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-[color:var(--store-forest)]/80">
            <div>
              <div className="text-lg font-semibold text-[color:var(--store-ink)]">
                48h
              </div>
              Fresh delivery windows
            </div>
            <div>
              <div className="text-lg font-semibold text-[color:var(--store-ink)]">
                120+
              </div>
              Local growers & makers
            </div>
            <div>
              <div className="text-lg font-semibold text-[color:var(--store-ink)]">
                4.9
              </div>
              Average customer rating
            </div>
          </div>
        </div>
        <div className="relative grid max-w-lg gap-4">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-lg animate-fade">
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Market edit
            </div>
            <div className="store-font-display mt-3 text-2xl font-semibold">
              For slow mornings
            </div>
            <p className="mt-2 text-sm text-[color:var(--store-forest)]/70">
              Single-origin coffee, glazed ceramics, and botanical teas.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1455470956270-4cbb357f3f24?q=80&w=600&auto=format&fit=crop"
              ].map((src) => (
                <img
                  key={src}
                  src={src}
                  alt="Curated product"
                  className="h-28 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-[color:var(--store-forest)] p-6 text-white shadow-xl animate-soft-pulse">
            <div className="text-xs uppercase tracking-[0.3em] text-white/70">
              Pantry essentials
            </div>
            <div className="store-font-display mt-3 text-2xl font-semibold">
              Build your staple box
            </div>
            <p className="mt-2 text-sm text-white/80">
              Seasonal grains, artisan oils, and easy-to-love condiments.
            </p>
          </div>
        </div>
      </section>

      <section
        id="collections"
        className="mx-auto w-full max-w-6xl px-6 py-12"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Collections
            </div>
            <h2 className="store-font-display text-3xl font-semibold">
              Shop by mood
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-[color:var(--store-forest)]"
          >
            View all products
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(categories.length ? categories : ["Pantry", "Home", "Wellness"]).map(
            (category, index) => (
              <Link
                key={`${category}-${index}`}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="store-font-display mt-3 text-2xl font-semibold">
                  {category}
                </div>
                <p className="mt-2 text-sm text-[color:var(--store-forest)]/70">
                  Elevated staples for your {category.toLowerCase()} rituals.
                </p>
                <div className="mt-4 text-sm font-semibold text-[color:var(--store-clay)]">
                  Explore
                </div>
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Featured
            </div>
            <h2 className="store-font-display text-3xl font-semibold">
              Market favorites
            </h2>
          </div>
          <div className="text-sm text-[color:var(--store-forest)]/70">
            Small-batch picks, restocked weekly.
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-72 rounded-2xl border border-black/10 bg-white/70 p-4"
                >
                  <div className="h-32 w-full animate-pulse rounded-2xl bg-[color:var(--store-mist)]" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[color:var(--store-mist)]" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[color:var(--store-mist)]" />
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
                          imageUrl: product.imageUrl
                        },
                        1,
                      )
                    }
                  />
                );
              })}
        </div>
      </section>

      <section
        id="story"
        className="mx-auto w-full max-w-6xl px-6 py-16"
      >
        <div className="grid gap-8 rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm md:grid-cols-[2fr_1fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--store-forest)]/70">
              Our promise
            </div>
            <h2 className="store-font-display mt-3 text-3xl font-semibold">
              Gathered slowly. Delivered beautifully.
            </h2>
            <p className="mt-4 text-sm text-[color:var(--store-forest)]/70">
              We partner with growers, roasters, and artisans who care about the
              details. Every shipment is packed by hand and delivered within 48
              hours so your staples stay vibrant.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Small batch", "Seasonal edits", "Personal concierge"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[color:var(--store-forest)]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--store-forest)]/80"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                title: "Restock alerts",
                desc: "Be the first to know when favorites return."
              },
              {
                title: "Subscription boxes",
                desc: "Curated delivery cadence that fits your rhythm."
              },
              {
                title: "Member pricing",
                desc: "Exclusive bundles and preview access."
              }
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-black/10 bg-[color:var(--store-sand)] px-5 py-4"
              >
                <div className="text-sm font-semibold">{card.title}</div>
                <div className="mt-2 text-xs text-[color:var(--store-forest)]/70">
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
