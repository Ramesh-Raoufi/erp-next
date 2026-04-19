import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/services/store.service";
import { handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
    const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const sort = searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | null ?? undefined;
    return NextResponse.json(await storeService.listProducts({ q, category, minPrice: min_price, maxPrice: max_price, sort }));
  } catch (e) { return handleError(e); }
}
