export async function fetchNextCode(resource: string, prefix: string): Promise<string> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`/api/${resource}?limit=1&sort=id&order=desc`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    const items: Array<{ code?: string | null }> = Array.isArray(data) ? data : (data.items ?? []);
    if (items.length === 0) return `${prefix}-001`;
    const lastCode = items[0].code ?? "";
    const match = lastCode.match(/(\d+)$/);
    if (!match) return `${prefix}-001`;
    const num = parseInt(match[1], 10) + 1;
    return `${prefix}-${String(num).padStart(3, "0")}`;
  } catch {
    return `${prefix}-001`;
  }
}
