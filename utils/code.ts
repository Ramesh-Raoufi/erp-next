import { ApiError } from "./http";

export function normalizeCode(value: unknown) {
  if (value == null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  const num = Number.parseInt(raw, 10);
  if (!Number.isFinite(num) || num <= 0) {
    throw new ApiError(400, "Code must be a positive number");
  }
  return String(num).padStart(5, "0");
}

export async function prepareCodeForCreate(options: {
  provided?: unknown;
  findByCode: (code: string) => Promise<{ id: number; deletedAt?: unknown } | null>;
  findByCodeAny: (code: string) => Promise<{ id: number; deletedAt?: unknown } | null>;
  getLatestCode: () => Promise<{ code: string | null } | null>;
  clearCodeForId?: (id: number) => Promise<void>;
}) {
  const normalized = normalizeCode(options.provided);
  if (normalized) {
    const existing = await options.findByCode(normalized);
    if (existing) {
      throw new ApiError(400, "Code already exists");
    }
    const existingAny = await options.findByCodeAny(normalized);
    if (existingAny && existingAny.deletedAt && options.clearCodeForId) {
      await options.clearCodeForId(existingAny.id);
    }
    return normalized;
  }

  const latest = await options.getLatestCode();
  const lastNumber = latest?.code ? Number.parseInt(latest.code, 10) : 0;
  return String((Number.isFinite(lastNumber) ? lastNumber : 0) + 1).padStart(5, "0");
}
