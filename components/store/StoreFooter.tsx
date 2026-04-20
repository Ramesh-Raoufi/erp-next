"use client";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-sm text-gray-400">© {new Date().getFullYear()} ERP Store</span>
        <div className="flex items-center gap-5">
          {[
            { label: "Products", to: "/products" },
            { label: "Cart", to: "/cart" },
            { label: "Track Order", to: "/track" },
          ].map((link) => (
            <Link key={link.to} href={link.to} className="text-sm text-gray-400 hover:text-slate-900 transition">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
