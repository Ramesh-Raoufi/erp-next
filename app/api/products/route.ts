/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { productsService } from "@/services/products.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await productsService.list());
  } catch (e) { return handleError(e); }
}

function normalizeBody(raw: Record<string, unknown>) {
  // Accept both camelCase and snake_case field names; coerce types for Prisma
  const b: Record<string, unknown> = { ...raw };
  // snake_case → camelCase mappings
  if ("unit_measure_id" in b) { b.unitMeasureId = b.unit_measure_id; delete b.unit_measure_id; }
  if ("is_active" in b) { b.isActive = b.is_active; delete b.is_active; }
  if ("compare_at_price" in b) { b.compareAtPrice = b.compare_at_price; delete b.compare_at_price; }
  if ("image_url" in b) { b.imageUrl = b.image_url; delete b.image_url; }
  // Type coercions
  if (b.isActive !== undefined) b.isActive = b.isActive === true || b.isActive === "true" || b.isActive === 1;
  if (b.quantity !== undefined) b.quantity = b.quantity === "" ? 0 : parseInt(String(b.quantity), 10);
  if (b.unitMeasureId !== undefined) b.unitMeasureId = b.unitMeasureId === "" || b.unitMeasureId === null ? undefined : parseInt(String(b.unitMeasureId), 10);
  if (b.unitMeasureId === undefined) delete b.unitMeasureId;
  return b;
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = normalizeBody(await req.json() as Record<string, unknown>);
    const result = await productsService.create(body as any);
    return NextResponse.json(result, { status: 201 });
  } catch (e) { return handleError(e); }
}
