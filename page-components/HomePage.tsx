"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import type { PublicTrackingResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppFooter } from "@/components/AppFooter";

export function HomePage() {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackingResponse | null>(null);

  const normalizedTracking = useMemo(
    () => trackingNumber.trim(),
    [trackingNumber],
  );

  const handleSearch = async () => {
    setError(null);
    setResult(null);

    const value = normalizedTracking;
    if (!value) {
      setError(t("home.errorEmpty"));
      return;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError(t("home.errorInvalid"));
      return;
    }

    setLoading(true);
    try {
      const data = await api.publicTracking(parsed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("home.errorNotFound"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("home.brand")}
            </div>
            <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
          </div>
          <Link href="/login">
            <Button variant="outline">{t("home.adminLogin")}</Button>
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border bg-card px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold">{t("home.heroTitle")}</h2>
            <p className="mt-3 text-muted-foreground">
              {t("home.heroSubtitle")}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <Input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder={t("home.placeholderTracking")}
                aria-label={t("home.placeholderTracking")}
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="sm:w-40"
              >
                {loading ? t("home.searching") : t("home.track")}
              </Button>
            </div>
            {error ? (
              <div className="mt-3 text-sm text-destructive">{error}</div>
            ) : null}
          </div>

          {result ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-background p-5">
                <div className="text-sm text-muted-foreground">
                  {t("home.resultTitle")}
                </div>
                <div className="mt-2 text-xl font-semibold">
                  #{result.transferId}
                </div>
                <div className="mt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("home.currentStatus")}
                    </span>
                    <span className="font-medium">{result.currentStatus}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("home.transferStatus")}
                    </span>
                    <span className="font-medium">{result.transferStatus}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-background p-5">
                <div className="text-sm text-muted-foreground">
                  {t("home.route")}
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {result.order.origin} → {result.order.destination}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {t("home.orderStatus")}:{" "}
                  <span className="font-medium text-foreground">
                    {result.order.status}
                  </span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {t("home.lastUpdate")}:{" "}
                  {new Date(result.lastUpdate).toLocaleString()}
                </div>
              </div>
            </div>
          ) : null}

          {result?.history?.length ? (
            <div className="mt-8 rounded-xl border bg-background p-5">
              <div className="text-sm font-semibold">
                {t("home.historyTitle")}
              </div>
              <div className="mt-4 space-y-3">
                {result.history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {item.location ? (
                      <div className="text-xs text-muted-foreground">
                        {t("home.location")}: {item.location}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: t("home.feature1Title"),
              body: t("home.feature1Body"),
            },
            {
              title: t("home.feature2Title"),
              body: t("home.feature2Body"),
            },
            {
              title: t("home.feature3Title"),
              body: t("home.feature3Body"),
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border bg-card p-5">
              <div className="text-base font-semibold">{card.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </section>
      </div>
      <AppFooter />
    </div>
  );
}
