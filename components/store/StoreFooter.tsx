"use client";
export function StoreFooter() {
  return (
    <footer className="border-t border-black/10 bg-[color:rgba(246,241,231,0.94)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="store-font-display text-lg font-semibold">
            Northwind Market
          </div>
          <div className="mt-2 text-sm text-[color:var(--store-forest)]/70">
            Crafted staples, delivered with care.
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--store-forest)]/70">
          Open daily · 9am - 8pm
        </div>
        <div className="text-sm text-[color:var(--store-forest)]/70">
          support@northwind.market · +1 (555) 019-2026
        </div>
      </div>
    </footer>
  );
}
