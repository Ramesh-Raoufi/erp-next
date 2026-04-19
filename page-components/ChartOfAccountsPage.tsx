"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type AccountType = {
  id: number;
  code?: string | number | null;
  name?: string | null;
  type?: string | null;
  description?: string | null;
};

type Account = {
  id: number;
  code?: string | number | null;
  name?: string | null;
  accountTypeId?: number | null;
  balance?: string | number | null;
  description?: string | null;
};

type AccountTypeGroup = {
  accountType: AccountType | null;
  accounts: Account[];
  key: string;
};

type CategoryGroup = {
  key: string;
  label: string;
  types: AccountTypeGroup[];
  totalBalance: number;
  totalAccounts: number;
};

const categoryOrder = [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
  "other",
];

function normalizeText(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function toCategoryKey(value: unknown) {
  const normalized = normalizeText(value);
  return normalized || "other";
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function sortByCodeOrName(a: { code?: unknown; name?: unknown }, b: { code?: unknown; name?: unknown }) {
  const codeA = String(a.code ?? "");
  const codeB = String(b.code ?? "");
  const numA = Number(codeA);
  const numB = Number(codeB);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  const codeCompare = codeA.localeCompare(codeB);
  if (codeCompare !== 0) return codeCompare;
  return String(a.name ?? "").localeCompare(String(b.name ?? ""));
}

export function ChartOfAccountsPage() {
  const { t, i18n } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const isRtl = i18n.dir(i18n.language) === "rtl";

  const categoryLabelMap = useMemo<Record<string, string>>(
    () => ({
      asset: t("pages.chartOfAccounts.categories.asset", {
        defaultValue: "Assets",
      }),
      liability: t("pages.chartOfAccounts.categories.liability", {
        defaultValue: "Liabilities",
      }),
      equity: t("pages.chartOfAccounts.categories.equity", {
        defaultValue: "Equity",
      }),
      income: t("pages.chartOfAccounts.categories.income", {
        defaultValue: "Income",
      }),
      expense: t("pages.chartOfAccounts.categories.expense", {
        defaultValue: "Expenses",
      }),
      other: t("pages.chartOfAccounts.categories.other", {
        defaultValue: "Other",
      }),
    }),
    [t],
  );

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 2,
      }),
    [i18n.language],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [typeRows, accountRows] = await Promise.all([
        api.list<AccountType>("account-types"),
        api.list<Account>("accounts"),
      ]);
      setAccountTypes(typeRows);
      setAccounts(accountRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const data = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const matchesSearch = (text: unknown) =>
      normalizedSearch === "" || normalizeText(text).includes(normalizedSearch);

    const accountTypeById = new Map<number, AccountType>();
    accountTypes.forEach((type) => {
      accountTypeById.set(type.id, type);
    });

    const typeAccountMap = new Map<number, Account[]>();
    accountTypes.forEach((type) => typeAccountMap.set(type.id, []));

    const unassignedAccounts: Account[] = [];
    const visibleAccounts: Account[] = [];

    for (const account of accounts) {
      const type =
        account.accountTypeId != null
          ? accountTypeById.get(Number(account.accountTypeId))
          : undefined;
      const categoryKey = toCategoryKey(type?.type);

      if (activeCategory !== "all" && categoryKey !== activeCategory) {
        continue;
      }

      const accountMatches =
        matchesSearch(account.code) ||
        matchesSearch(account.name) ||
        matchesSearch(account.description) ||
        matchesSearch(type?.code) ||
        matchesSearch(type?.name) ||
        matchesSearch(type?.type);

      if (!accountMatches) continue;

      visibleAccounts.push(account);

      if (type) {
        typeAccountMap.get(type.id)?.push(account);
      } else {
        unassignedAccounts.push(account);
      }
    }

    const categoryMap = new Map<string, CategoryGroup>();
    const ensureCategory = (key: string) => {
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          key,
          label: categoryLabelMap[key] ?? key,
          types: [],
          totalBalance: 0,
          totalAccounts: 0,
        });
      }
      return categoryMap.get(key)!;
    };

    for (const type of accountTypes) {
      const categoryKey = toCategoryKey(type.type);
      if (activeCategory !== "all" && categoryKey !== activeCategory) {
        continue;
      }

      const accountsForType = typeAccountMap.get(type.id) ?? [];
      const typeMatches =
        matchesSearch(type.code) ||
        matchesSearch(type.name) ||
        matchesSearch(type.description) ||
        matchesSearch(type.type);

      if (normalizedSearch && accountsForType.length === 0 && !typeMatches) {
        continue;
      }

      ensureCategory(categoryKey).types.push({
        accountType: type,
        accounts: accountsForType,
        key: String(type.id),
      });
    }

    if (unassignedAccounts.length) {
      const categoryKey = "other";
      if (activeCategory === "all" || activeCategory === categoryKey) {
        ensureCategory(categoryKey).types.push({
          accountType: {
            id: -1,
            name: t("pages.chartOfAccounts.unassignedType", {
              defaultValue: "Unassigned",
            }),
          },
          accounts: unassignedAccounts,
          key: "unassigned",
        });
      }
    }

    const categoryList = Array.from(categoryMap.values())
      .map((category) => {
        const sortedTypes = [...category.types].sort((a, b) =>
          sortByCodeOrName(a.accountType ?? {}, b.accountType ?? {}),
        );
        sortedTypes.forEach((group) => {
          group.accounts.sort(sortByCodeOrName);
        });
        let totalBalance = 0;
        let totalAccounts = 0;
        sortedTypes.forEach((group) => {
          totalAccounts += group.accounts.length;
          group.accounts.forEach((account) => {
            totalBalance += toNumber(account.balance);
          });
        });
        return {
          ...category,
          types: sortedTypes,
          totalBalance,
          totalAccounts,
        };
      })
      .sort((a, b) => {
        const orderA = categoryOrder.indexOf(a.key);
        const orderB = categoryOrder.indexOf(b.key);
        const safeA = orderA === -1 ? categoryOrder.length + 1 : orderA;
        const safeB = orderB === -1 ? categoryOrder.length + 1 : orderB;
        return safeA - safeB;
      });

    const typeCount = categoryList.reduce(
      (sum, category) => sum + category.types.length,
      0,
    );

    const totalBalance = visibleAccounts.reduce(
      (sum, account) => sum + toNumber(account.balance),
      0,
    );

    return {
      categoryList,
      typeCount,
      totalBalance,
      visibleAccounts,
    };
  }, [accounts, accountTypes, activeCategory, categoryLabelMap, search, t]);

  const availableCategories = useMemo(() => {
    const keys = new Set<string>();
    accountTypes.forEach((type) => {
      keys.add(toCategoryKey(type.type));
    });
    if (accounts.some((account) => account.accountTypeId == null)) {
      keys.add("other");
    }
    const ordered = categoryOrder.filter((key) => keys.has(key));
    return ["all", ...ordered];
  }, [accountTypes, accounts]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("all");
  };

  const alignText = isRtl ? "text-right" : "text-left";
  const alignEnd = isRtl ? "text-left" : "text-right";

  const formatBalance = (raw: unknown) => {
    if (raw == null || raw === "") return "-";
    const rawText = String(raw);
    if (/[a-zA-Z]/.test(rawText)) return rawText;
    const numeric = toNumber(rawText);
    return Number.isFinite(numeric)
      ? numberFormatter.format(numeric)
      : rawText;
  };

  const totalAccounts = data.visibleAccounts.length;
  const totalTypes = data.typeCount;
  const totalBalance = numberFormatter.format(data.totalBalance);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-sm font-semibold text-blue-700">
                COA
              </div>
              <div>
                <h1 className="text-2xl font-semibold">
                  {t("pages.chartOfAccounts.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("pages.chartOfAccounts.subtitle")}
                </p>
              </div>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              {t("pages.chartOfAccounts.description", {
                defaultValue:
                  "Review account structures, balances, and account types in a single view.",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              {t("crud.refresh")}
            </Button>
            {search || activeCategory !== "all" ? (
              <Button variant="outline" onClick={clearFilters}>
                {t("pages.chartOfAccounts.clearFilters", {
                  defaultValue: "Clear filters",
                })}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.chartOfAccounts.summary.accounts", {
                defaultValue: "Accounts",
              })}
            </div>
            <div className="mt-2 text-2xl font-semibold">{totalAccounts}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.chartOfAccounts.summary.types", {
                defaultValue: "Account types",
              })}
            </div>
            <div className="mt-2 text-2xl font-semibold">{totalTypes}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-white/70 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.chartOfAccounts.summary.balance", {
                defaultValue: "Total balance",
              })}
            </div>
            <div className="mt-2 text-2xl font-semibold">{totalBalance}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-blue-200 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.chartOfAccounts.filters.searchLabel", {
                defaultValue: "Search",
              })}
            </label>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("pages.chartOfAccounts.filters.searchPlaceholder", {
                defaultValue: "Search accounts, account types, or codes",
              })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("pages.chartOfAccounts.filters.groupLabel", {
                  defaultValue: "Account groups",
                })}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("pages.chartOfAccounts.filters.results", {
                  defaultValue: "Showing",
                })}{" "}
                {totalAccounts}{" "}
                {t("pages.chartOfAccounts.filters.resultsSuffix", {
                  defaultValue: "accounts",
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
                    )}
                  >
                    {category === "all"
                      ? t("pages.chartOfAccounts.filters.allTypes", {
                          defaultValue: "All types",
                        })
                      : categoryLabelMap[category] ??
                        category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="rounded-xl border border-blue-200 bg-white p-4"
            >
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : data.categoryList.length === 0 ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 text-sm text-muted-foreground">
          {t("pages.chartOfAccounts.emptyState", {
            defaultValue: "No accounts match your current filters.",
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {data.categoryList.map((category) => (
            <section key={category.key} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-12 rounded-full bg-blue-500" />
                  <div>
                    <h2 className="text-lg font-semibold">{category.label}</h2>
                    <div className="text-xs text-muted-foreground">
                      {category.totalAccounts} {t("pages.chartOfAccounts.accountsLabel", { defaultValue: "accounts" })}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("pages.chartOfAccounts.categoryBalance", {
                    defaultValue: "Category balance:",
                  })}{" "}
                  <span className="font-medium text-foreground">
                    {numberFormatter.format(category.totalBalance)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {category.types.map((group) => {
                  const accountType = group.accountType;
                  const typeLabel =
                    accountType?.name ||
                    t("pages.chartOfAccounts.untitledType", {
                      defaultValue: "Untitled type",
                    });
                  const typeCode = accountType?.code
                    ? String(accountType.code)
                    : null;
                  const typeMeta = accountType?.type
                    ? String(accountType.type)
                    : null;

                  return (
                    <div
                      key={group.key}
                      className="rounded-xl border border-blue-200 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {typeCode ? (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                {typeCode}
                              </span>
                            ) : null}
                            <span className="text-sm font-semibold">
                              {typeLabel}
                            </span>
                          </div>
                          {accountType?.description ? (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {accountType.description}
                            </div>
                          ) : null}
                        </div>
                        {typeMeta ? (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {typeMeta}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 rounded-lg border border-blue-100 bg-white">
                        <div
                          className={cn(
                            "grid grid-cols-[minmax(72px,auto)_1fr_auto] gap-3 border-b border-blue-100 bg-blue-50/50 px-3 py-2 text-xs font-semibold text-muted-foreground",
                            alignText,
                          )}
                        >
                          <span>{t("fields.code", { defaultValue: "Code" })}</span>
                          <span>{t("fields.name", { defaultValue: "Name" })}</span>
                          <span className={alignEnd}>
                            {t("fields.balance", { defaultValue: "Balance" })}
                          </span>
                        </div>
                        <div className="divide-y divide-blue-100">
                          {group.accounts.length ? (
                            group.accounts.map((account) => (
                              <div
                                key={account.id}
                                className={cn(
                                  "grid grid-cols-[minmax(72px,auto)_1fr_auto] gap-3 px-3 py-2 text-sm",
                                  alignText,
                                )}
                              >
                                <span className="text-xs text-muted-foreground">
                                  {account.code ?? "-"}
                                </span>
                                <div>
                                  <div className="font-medium">
                                    {account.name ?? "-"}
                                  </div>
                                  {account.description ? (
                                    <div className="text-xs text-muted-foreground">
                                      {account.description}
                                    </div>
                                  ) : null}
                                </div>
                                <div className={cn("text-sm font-semibold", alignEnd)}>
                                  {formatBalance(account.balance)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-3 text-xs text-muted-foreground">
                              {t("pages.chartOfAccounts.noAccounts", {
                                defaultValue: "No accounts in this type yet.",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
