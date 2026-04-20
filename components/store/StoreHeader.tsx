'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";

const nav = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Track Order", to: "/track" },
];

export function StoreHeader() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/80 backdrop-blur-lg shadow-lg"
          : "bg-slate-950"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            📦
          </div>
          <div className="text-white font-bold text-lg tracking-tight">
            ERP Store
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === item.to
                  ? "bg-purple-600 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            🛒 Cart
            {totalItems > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
              >
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="hidden md:block text-xs uppercase tracking-widest text-white/50 hover:text-white/80 transition"
          >
            Admin
          </Link>
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white transition"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-6 py-4">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 block rounded-xl px-4 py-3 text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition"
            onClick={() => setMenuOpen(false)}
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
