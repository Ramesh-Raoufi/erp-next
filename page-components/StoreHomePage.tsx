"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StoreLayout } from "@/components/store/StoreLayout";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { api, type StoreProduct } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { parsePrice } from "@/lib/store";

const CATEGORY_ICONS: Record<string, string> = {
  Pantry: "📦",
  Home: "🏠",
  Wellness: "💊",
  Garden: "🍃",
  Electronics: "💻",
  Clothing: "👗",
  Beauty: "💄",
  Sports: "⚽",
  Toys: "🧸",
  Books: "📚",
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "🛍️";
}

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
    return () => {
      active = false;
    };
  }, []);

  return (
    <StoreLayout>
      {/* ── HERO ── */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{
          background:
            "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        {/* Animated floating dots */}
        <style>{`
          @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);opacity:.35} 50%{transform:translate(20px,-30px) scale(1.2);opacity:.6} }
          @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1);opacity:.25} 50%{transform:translate(-15px,25px) scale(0.8);opacity:.5} }
          @keyframes float3 { 0%,100%{transform:translate(0,0);opacity:.2} 50%{transform:translate(10px,-20px);opacity:.45} }
          .dot1{animation:float1 7s ease-in-out infinite;}
          .dot2{animation:float2 9s ease-in-out infinite 1s;}
          .dot3{animation:float3 11s ease-in-out infinite 2s;}
          .dot4{animation:float1 8s ease-in-out infinite 3s;}
          .dot5{animation:float2 6s ease-in-out infinite 0.5s;}
        `}</style>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="dot1 absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-purple-600 opacity-30 blur-3xl" />
          <div className="dot2 absolute right-[15%] top-[30%] h-48 w-48 rounded-full bg-indigo-500 opacity-25 blur-3xl" />
          <div className="dot3 absolute bottom-[20%] left-[30%] h-72 w-72 rounded-full bg-cyan-600 opacity-20 blur-3xl" />
          <div className="dot4 absolute right-[5%] bottom-[15%] h-40 w-40 rounded-full bg-violet-700 opacity-30 blur-2xl" />
          <div className="dot5 absolute left-[50%] top-[10%] h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            🏪 ERP Store
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Premium Products
            <br />
            Delivered{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, #a855f7, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Fast
            </span>
          </h1>
          <p className="mb-10 text-lg text-white/60 md:text-xl">
            Discover curated products from trusted suppliers, delivered to your
            door within 48 hours.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-full px-8 py-4 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-purple-500/40"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              }}
            >
              Shop Now →
            </Link>
            <Link
              href="/products"
              className="rounded-full border border-white/30 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-0 divide-x divide-white/20 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm">
          {[
            { value: "120+", label: "Products" },
            { value: "48h", label: "Fast Delivery" },
            { value: "4.9★", label: "Trusted Quality" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <div className="mb-1 flex items-center gap-3">
              <div
                className="h-8 w-1.5 rounded-full"
                style={{ background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }}
              />
              <h2 className="text-3xl font-black text-gray-900">
                Shop by Category
              </h2>
            </div>
            <p className="ml-5 text-gray-500">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(categories.length
              ? categories
              : ["Pantry", "Home", "Wellness", "Garden"]
            ).map((category, i) => (
              <Link
                key={`${category}-${i}`}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group rounded-2xl border-2 border-transparent bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-400 hover:shadow-lg"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <div className="mb-3 text-4xl">{getCategoryIcon(category)}</div>
                <div className="font-bold text-gray-900">{category}</div>
                <div className="mt-1 text-xs text-gray-400">Browse products</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <div
                  className="h-8 w-1.5 rounded-full"
                  style={{ background: "linear-gradient(180deg, #7c3aed, #06b6d4)" }}
                />
                <h2 className="text-3xl font-black text-gray-900">
                  Featured Products
                </h2>
              </div>
              <p className="ml-5 text-gray-500">Hand-picked favorites</p>
            </div>
            <Link
              href="/products"
              className="rounded-full px-5 py-2 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              View All →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="h-72 overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <div className="h-44 w-full animate-pulse bg-gray-200" />
                    <div className="p-4">
                      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
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

      {/* ── WHY CHOOSE US ── */}
      <section
        className="px-6 py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: "🚚",
                title: "Fast Delivery",
                desc: "Ships within 48 hours to your door",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                desc: "SSL encrypted checkout, always safe",
              },
              {
                icon: "⭐",
                title: "Quality Guaranteed",
                desc: "Top-rated products, curated with care",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className="mb-4 text-5xl">{f.icon}</div>
                <div className="mb-2 text-xl font-bold">{f.title}</div>
                <div className="text-white/70">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-4xl font-black text-gray-900">
            Ready to start shopping?
          </h2>
          <p className="mb-8 text-lg text-gray-500">
            Browse our full catalog of premium products
          </p>
          <Link
            href="/products"
            className="inline-block rounded-full px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            }}
          >
            Browse All Products →
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
}
