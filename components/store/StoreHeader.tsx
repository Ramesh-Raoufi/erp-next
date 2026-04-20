'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

const nav = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Track", to: "/track" },
];

export function StoreHeader() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="text-slate-900 font-semibold text-base">
          ERP Store
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`text-sm transition ${
                pathname === item.to
                  ? "text-slate-900 font-medium"
                  : "text-gray-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Cart */}
        <Link href="/cart" className="relative flex items-center text-gray-500 hover:text-slate-900 transition">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
