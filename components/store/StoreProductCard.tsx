'use client';
import Link from "next/link";
import { formatCurrency, parsePrice } from "@/lib/store";
import type { StoreProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function StoreProductCard({
  product,
  onAdd
}: {
  product: StoreProduct;
  onAdd: () => void;
}) {
  const price = parsePrice(product.price);
  const compareAt = parsePrice(product.compareAtPrice ?? null);
  const soldOut = product.quantity <= 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="relative h-48 w-full">
        <img
          src={
            product.imageUrl ||
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=900&auto=format&fit=crop"
          }
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.category ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--store-forest)]">
            {product.category}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="store-font-display text-lg font-semibold">
            {product.name}
          </div>
          <p className="mt-2 text-sm text-[color:var(--store-forest)]/70">
            {product.description || "Quietly bold staples designed for every day."}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-[color:var(--store-ink)]">
              {formatCurrency(price)}
            </div>
            {compareAt > price ? (
              <div className="text-xs text-[color:var(--store-clay)] line-through">
                {formatCurrency(compareAt)}
              </div>
            ) : null}
          </div>
          <Button
            size="sm"
            className="bg-[color:var(--store-forest)] text-white hover:bg-[color:var(--store-olive)]"
            onClick={onAdd}
            disabled={soldOut}
          >
            {soldOut ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
