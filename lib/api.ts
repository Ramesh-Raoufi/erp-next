/* eslint-disable @typescript-eslint/no-explicit-any */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

export type CrudResource =
  | "users"
  | "customers"
  | "products"
  | "orders"
  | "transfers"
  | "drivers"
  | "payments"
  | "expenses"
  | "adjustments"
  | "tracking"
  | "account-types"
  | "accounts"
  | "unit-measures";

export type PublicTrackingResponse = {
  transferId: number;
  transferStatus: string;
  order: {
    id: number;
    origin: string;
    destination: string;
    status: string;
  };
  currentStatus: string;
  lastUpdate: string;
  history: Array<{
    id: number;
    status: string;
    location: string | null;
    updatedAt: string;
  }>;
};

export type StoreProduct = {
  id: number;
  name: string;
  description?: string | null;
  price: string;
  compareAtPrice?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  quantity: number;
};

export type StoreOrderResponse = {
  id: number;
  code?: string | null;
  status: string;
  totalPrice: string;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const api = {
  health() {
    return apiFetch<{ ok: boolean }>("/api/health");
  },

  auth: {
    login(body: { username: string; password: string }) {
      return apiFetch<{ token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
      });
    },
    bootstrap(body: { name: string; lastName: string; username: string; email: string; password: string }) {
      return apiFetch<{ token: string; user: any }>("/api/auth/bootstrap", {
        method: "POST",
        body: JSON.stringify(body)
      });
    },
    me() {
      return apiFetch<any>("/api/auth/me");
    }
  },

  list<T>(resource: CrudResource) {
    return apiFetch<T[]>(`/api/${resource}`);
  },

  get<T>(resource: CrudResource, id: number) {
    return apiFetch<T>(`/api/${resource}/${id}`);
  },

  create<T>(resource: CrudResource, body: unknown) {
    return apiFetch<T>(`/api/${resource}`, { method: "POST", body: JSON.stringify(body) });
  },

  update<T>(resource: CrudResource, id: number, body: unknown) {
    return apiFetch<T>(`/api/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },

  remove<T>(resource: CrudResource, id: number) {
    return apiFetch<T>(`/api/${resource}/${id}`, { method: "DELETE" });
  },

  reports: {
    revenue() {
      return apiFetch<{ total_revenue: string }>("/api/reports/revenue");
    },
    expenses() {
      return apiFetch<{
        shipment_expenses: string;
        general_expenses: string;
        total_expenses: string;
      }>("/api/reports/expenses");
    },
    profitLoss() {
      return apiFetch<{
        revenue: string;
        shipment_expenses: string;
        general_expenses: string;
        adjustments: string;
        profit: string;
      }>("/api/reports/profit-loss");
    }
  },

  publicTracking(transferId: number) {
    return apiFetch<PublicTrackingResponse>(`/api/public/tracking/${transferId}`);
  },

  store: {
    listProducts(params?: {
      q?: string;
      category?: string;
      min_price?: number;
      max_price?: number;
      sort?: "newest" | "price_asc" | "price_desc";
    }) {
      const query = buildQuery(params ?? {});
      return apiFetch<StoreProduct[]>(`/api/store/products${query}`);
    },
    getProduct(id: number) {
      return apiFetch<StoreProduct>(`/api/store/products/${id}`);
    },
    categories() {
      return apiFetch<string[]>(`/api/store/categories`);
    },
    createOrder(body: {
      customer: {
        name: string;
        lastName?: string;
        email: string;
        phone?: string;
      };
      shipping: {
        address1: string;
        address2?: string;
        city: string;
        region?: string;
        postalCode?: string;
        country: string;
      };
      items: Array<{ product_id: number; quantity: number }>;
      payment_method?: "cash" | "card" | "bank";
    }) {
      return apiFetch<StoreOrderResponse>(`/api/store/orders`, {
        method: "POST",
        body: JSON.stringify(body)
      });
    }
  }
};
