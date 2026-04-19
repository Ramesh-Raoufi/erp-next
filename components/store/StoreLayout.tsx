'use client';
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="store-theme store-font-body relative min-h-screen bg-[color:var(--store-sand)] text-[color:var(--store-ink)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,209,184,0.8),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(192,106,74,0.25),transparent_70%)] blur-xl" />
        <div className="absolute left-12 top-1/2 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(111,123,85,0.25),transparent_70%)] blur-xl" />
      </div>
      <StoreHeader />
      <main className="relative z-10">{children}</main>
      <StoreFooter />
    </div>
  );
}
