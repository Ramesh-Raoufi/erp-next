"use client";
import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Logo + tagline */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-lg"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
              >
                📦
              </div>
              <div className="text-lg font-bold tracking-tight">ERP Store</div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Premium products curated for quality and delivered fast. Your
              trusted e-commerce partner.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              Quick Links
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", to: "/" },
                { label: "Products", to: "/products" },
                { label: "Cart", to: "/cart" },
                { label: "Track Order", to: "/track" },
              ].map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              Contact
            </div>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <div>support@erpstore.com</div>
              <div>+1 (555) 019-2026</div>
              <div className="mt-2 text-white/40">Open daily · 9am – 8pm</div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} ERP Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
