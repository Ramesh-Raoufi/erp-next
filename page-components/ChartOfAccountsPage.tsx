"use client";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CrudLayout } from "@/components/layout/CrudLayout";
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

const categoryOrder = ["asset", "liability", "equity", "income", "expense", "other"];

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
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) return numA - numB;
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
      asset: t("pages.chartOfAccounts.categories.asset", { defaultValue: "Assets" }),
      liability: t("pages.chartOfAccounts.categories.liability", { defaultValue: "Liabilities" }),
      equity: t("pages.chartOfAccounts.categories.equity", { defaultValue: "Equity" }),
      income: t("pages.chartOfAccounts.categories.income", { defaultValue: "Income" }),
      expense: t("pages.chartOfAccounts.categories.expense", { defaultValue: "Expenses" }),
      other: t("pages.chartOfAccounts.categories.other", { defaultValue: "Other" }),
    }),
    [t],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }),
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

  useEffect(() => { void load(); }, []);

  const data = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const matchesSearch = (text: unknown) => normalizedSearch === "" || normalizeText(text).includes(normalizedSearch);
    const accountTypeById = new Map<number, AccountType>();
    accountTypes.forEach((type) => accountTypeById.set(type.id, type));
    const typeAccountMap = new Map<number, Account[]>();
    accountTypes.forEach((type) => typeAccountMap.set(type.id, []));
    const unassignedAccounts: Account[] = [];
    const visibleAccounts: Account[] = [];

    for (const account of accounts) {
      const type = account.accountTypeId != null ? accountTypeById.get(Number(account.accountTypeId)) : undefined;
      const categoryKey = toCategoryKey(type?.type);
      if (activeCategory !== "all" && categoryKey !== activeCategory) continue;
      const accountMatches = matchesSearch(account.code) || matchesSearch(account.name) || matchesSearch(account.description) || matchesSearch(type?.code) || matchesSearch(type?.name) || matchesSearch(type?.type);
      if (!accountMatches) continue;
      visibleAccounts.push(account);
      if (type) typeAccountMap.get(type.id)?.push(account);
      else unassignedAccounts.push(account);
    }

    const categoryMap = new Map<string, CategoryGroup>();
    const ensureCategory = (key: string) => {
      if (!categoryMap.has(key)) categoryMap.set(key, { key, label: categoryLabelMap[key] ?? key, types: [], totalBalance: 0, totalAccounts: 0 });
      return categoryMap.get(key)!;
    };

    for (const type of accountTypes) {
      const categoryKey = toCategoryKey(type.type);
      if (activeCategory !== "all" && categoryKey !== activeCategory) continue;
      const accountsForType = typeAccountMap.get(type.id) ?? [];
      const typeMatches = matchesSearch(type.code) || matchesSearch(type.name) || matchesSearch(type.description) || matchesSearch(type.type);
      if (normalizedSearch && accountsForType.length === 0 && !typeMatches) continue;
      ensureCategory(categoryKey).types.push({ accountType: type, accounts: accountsForType, key: String(type.id) });
    }

    if (unassignedAccounts.length) {
      const categoryKey = "other";
      if (activeCategory === "all" || activeCategory === categoryKey) {
        ensureCategory(categoryKey).types.push({ accountType: { id: -1, name: t("pages.chartOfAccounts.unassignedType", { defaultValue: "Unassigned" }) }, accounts: unassignedAccounts, key: "unassigned" });
      }
    }

    const categoryList = Array.from(categoryMap.values()).map((category) => {
      const sortedTypes = [...category.types].sort((a, b) => sortByCodeOrName(a.accountType ?? {}, b.accountType ?? {}));
      sortedTypes.forEach((group) => { group.accounts.sort(sortByCodeOrName); });
      let totalBalance = 0; let totalAccounts = 0;
      sortedTypes.forEach((group) => { totalAccounts += group.accounts.length; group.accounts.forEach((account) => { totalBalance += toNumber(account.balance); }); });
      return { ...category, types: sortedTypes, totalBalance, totalAccounts };
    }).sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.key);
      const orderB = categoryOrder.indexOf(b.key);
      return (orderA === -1 ? categoryOrder.length + 1 : orderA) - (orderB === -1 ? categoryOrder.length + 1 : orderB);
    });

    return {
      categoryList,
      typeCount: categoryList.reduce((sum, c) => sum + c.types.length, 0),
      totalBalance: visibleAccounts.reduce((sum, a) => sum + toNumber(a.balance), 0),
      visibleAccounts,
    };
  }, [accounts, accountTypes, activeCategory, categoryLabelMap, search, t]);

  const availableCategories = useMemo(() => {
    const keys = new Set<string>();
    accountTypes.forEach((type) => keys.add(toCategoryKey(type.type)));
    if (accounts.some((a) => a.accountTypeId == null)) keys.add("other");
    return ["all", ...categoryOrder.filter((k) => keys.has(k))];
  }, [accountTypes, accounts]);

  const alignEnd = isRtl ? "text-left" : "text-right";

  const formatBalance = (raw: unknown) => {
    if (raw == null || raw === "") return "-";
    const rawText = String(raw);
    if (/[a-zA-Z]/.test(rawText)) return rawText;
    const numeric = toNumber(rawText);
    return Number.isFinite(numeric) ? numberFormatter.format(numeric) : rawText;
  };

  return (
    <CrudLayout
      title={t("pages.chartOfAccounts.title", { defaultValue: "Chart of Accounts" })}
      subtitle={`${data.visibleAccounts.length} accounts · ${data.typeCount} types`}
      actions={
        <>
          {(search || activeCategory !== "all") && (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
              Clear filters
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </>
      }
    >
      <div className="p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-blue-50 p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Accounts</div>
            <div className="text-xl font-bold">{data.visibleAccounts.length}</div>
          </div>
          <div className="rounded-lg border bg-blue-50 p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Account Types</div>
            <div className="text-xl font-bold">{data.typeCount}</div>
          </div>
          <div className="rounded-lg border bg-blue-50 p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Total Balance</div>
            <div className="text-xl font-bold">{numberFormatter.format(data.totalBalance)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search accounts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-input px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-1 flex-wrap">
            {availableCategories.map((key) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                  activeCategory === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {key === "all" ? "All" : (categoryLabelMap[key] ?? key)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : data.categoryList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No accounts found.</div>
        ) : (
          data.categoryList.map((category) => (
            <section key={category.key} className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <h2 className="font-semibold text-base text-gray-800">{category.label}</h2>
                <span className="text-xs text-gray-500">{category.totalAccounts} accounts · {numberFormatter.format(category.totalBalance)}</span>
              </div>
              {category.types.map((group) => {
                const { accountType, accounts: groupAccounts } = group;
                const typeCode = accountType?.code ? String(accountType.code) : null;
                const typeLabel = accountType?.name ?? "Unassigned";
                return (
                  <div key={group.key} className="rounded-lg border bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {typeCode && <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{typeCode}</span>}
                        <span className="text-sm font-semibold">{typeLabel}</span>
                      </div>
                      {accountType?.description && <span className="text-xs text-gray-400">{accountType.description}</span>}
                    </div>
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-[80px_1fr_auto] gap-2 border-b bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                        <span>Code</span><span>Name</span><span className={alignEnd}>Balance</span>
                      </div>
                      <div className="divide-y">
                        {groupAccounts.length ? groupAccounts.map((account) => (
                          <div key={account.id} className="grid grid-cols-[80px_1fr_auto] gap-2 px-3 py-2 text-sm">
                            <span className="text-xs text-gray-400">{account.code ?? "-"}</span>
                            <div>
                              <div className="font-medium">{account.name ?? "-"}</div>
                              {account.description && <div className="text-xs text-gray-400">{account.description}</div>}
                            </div>
                            <div className={cn("font-semibold text-sm", alignEnd)}>{formatBalance(account.balance)}</div>
                          </div>
                        )) : (
                          <div className="px-3 py-3 text-xs text-gray-400">No accounts in this type yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        )}
      </div>
    </CrudLayout>
  );
}
