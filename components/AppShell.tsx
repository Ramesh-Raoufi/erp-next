'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { AppFooter } from "@/components/AppFooter";

const linkBase =
  "inline-flex items-center rounded-full px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isRtl = i18n.dir(i18n.language) === "rtl";
  const navItems = [
    { label: t("nav.dashboard"), to: "/app/dashboard" },
    { label: t("nav.users"), to: "/app/users", roles: ["admin"] },
    { label: t("nav.customers"), to: "/app/customers", roles: ["admin"] },
    {
      label: t("nav.products"),
      to: "/app/products",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.unitMeasures"),
      to: "/app/unit-measures",
      roles: ["admin", "operator"],
    },
    {
      label: t("nav.orders"),
      to: "/app/orders",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.transfers"),
      to: "/app/transfers",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.drivers"),
      to: "/app/drivers",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.payments"),
      to: "/app/payments",
      roles: ["admin", "accountant"],
    },
    {
      label: t("nav.expenses"),
      to: "/app/expenses",
      roles: ["admin", "accountant"],
    },
    {
      label: t("nav.accountTypes"),
      to: "/app/account-types",
      roles: ["admin", "accountant"],
    },
    {
      label: t("nav.accounts"),
      to: "/app/accounts",
      roles: ["admin", "accountant"],
    },
    {
      label: t("nav.chartOfAccounts"),
      to: "/app/chart-of-accounts",
      roles: ["admin", "accountant"],
    },
    {
      label: t("nav.adjustments"),
      to: "/app/adjustments",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.tracking"),
      to: "/app/tracking",
      roles: ["admin", "operator", "driver"],
    },
    {
      label: t("nav.reports"),
      to: "/app/reports",
      roles: ["admin", "accountant"],
    },
    { label: t("nav.settings"), to: "/app/settings" },
    { label: t("nav.vendors"), to: "/app/vendors", roles: ["admin", "accountant"] },
    { label: t("nav.bills"), to: "/app/bills", roles: ["admin", "accountant"] },
    { label: t("nav.invoices"), to: "/app/invoices", roles: ["admin", "accountant", "operator"] },
    { label: t("nav.purchaseOrders"), to: "/app/purchase-orders", roles: ["admin", "accountant", "operator"] },
    { label: t("nav.customerPayments"), to: "/app/customer-payments", roles: ["admin", "accountant"] },
  ];
  const role = user?.role;
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (role ? item.roles.includes(role) : false),
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-blue-700 bg-blue-600 text-white">
        <div className="px-4 sm:px-6">
          <div className="flex min-h-14 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={t("appShell.menu", { defaultValue: "Menu" })}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-200 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                href="/app/dashboard"
                className="text-lg font-semibold tracking-wide text-white"
              >
                Logo
              </Link>
            </div>

            <nav
              className={cn(
                "hidden flex-1 items-center gap-2 overflow-x-auto lg:flex no-scrollbar",
                isRtl ? "justify-center" : "justify-start",
              )}
            >
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.to || (item.to === "/app/dashboard" && pathname === "/app/dashboard");
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className={cn(linkBase, isActive && "bg-white/20 text-white")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={logout}
              aria-label={t("appShell.signOut")}
              title={t("appShell.signOut")}
              className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("appShell.closeMenu", { defaultValue: "Close menu" })}
            onClick={() => setMobileOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute top-0 h-full w-72 max-w-[85vw] bg-blue-700 px-5 py-6 text-white shadow-2xl flex flex-col",
              isRtl ? "right-0" : "left-0",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                {t("appShell.menu", { defaultValue: "Menu" })}
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-blue-200"
                aria-label={t("appShell.closeMenu", {
                  defaultValue: "Close menu",
                })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="no-scrollbar mt-6 flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white",
                      isActive && "bg-white/20 text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/15 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                {t("appShell.signOut")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
