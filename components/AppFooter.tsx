"use client";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

export function AppFooter() {
  const { t, i18n } = useTranslation();
  const { user, loginAt } = useAuth();

  const loginText = useMemo(() => {
    if (!user || !loginAt) {
      return t("footer.notLoggedIn");
    }
    const date = new Date(loginAt);
    const formatted = Number.isNaN(date.getTime())
      ? loginAt
      : date.toLocaleString(i18n.language);
    return t("footer.loggedInAt", { date: formatted });
  }, [user, loginAt, i18n.language, t]);

  const displayName = user
    ? `${user.name ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.username ||
      user.email ||
      t("footer.userFallback")
    : t("footer.userFallback");
  const userLabel = t("footer.userLabel");

  return (
    <footer className="border-t border-blue-700 bg-blue-600 px-4 text-xs text-white/90">
      <div
        className={` flex min-h-10 flex-col  gap-1 sm:flex-row sm:items-center `}
      >
        <span className="text-white/90">{`${userLabel}${displayName}`}</span>
        <span className="text-white/80">{loginText}</span>
      </div>
    </footer>
  );
}
