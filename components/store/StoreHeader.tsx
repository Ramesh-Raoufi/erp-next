'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/products", active: true },
  { label: "Story", to: "/#story", active: false },
  { label: "Collections", to: "/#collections", active: false }
];

export function StoreHeader() {
  const { totalItems, subtotal } = useCart();
  const pathname = usePathname();

  return (
    <header className="relative z-10 border-b border-black/10 bg-[color:rgba(246,241,231,0.86)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-[color:var(--store-mist)] text-lg font-semibold text-[color:var(--store-forest)]">
              N
            </div>
            <div>
              <div className="store-font-display text-lg font-semibold tracking-tight">
                Northwind Market
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--store-forest)]/70">
                Everyday essentials
              </div>
            </div>
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm"
          >
            <span>Cart</span>
            <span className="rounded-full bg-[color:var(--store-forest)] px-2 py-0.5 text-xs text-white">
              {totalItems}
            </span>
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {nav.map((item) =>
            item.active ? (
              <Link
                key={item.to}
                href={item.to}
                className={`rounded-full px-3 py-1 transition ${
                  pathname === item.to
                    ? "bg-[color:var(--store-forest)] text-white"
                    : "text-[color:var(--store-forest)]/80 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.to}
                href={item.to}
                className="rounded-full px-3 py-1 text-[color:var(--store-forest)]/80 transition hover:bg-white"
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="ml-2 hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-[color:var(--store-forest)]/70 md:flex">
            <span>Subtotal</span>
            <span className="font-semibold text-[color:var(--store-ink)]">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <Link
            href="/login"
            className="ml-auto text-xs uppercase tracking-[0.2em] text-[color:var(--store-forest)]/70 hover:text-[color:var(--store-forest)]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
