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
    <div className="relative min-h-screen bg-white text-slate-900">
      <StoreHeader />
      <main>{children}</main>
      <StoreFooter />
    </div>
  );
}
