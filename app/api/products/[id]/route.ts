/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { productsService } from "@/services/products.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await productsService.getById(parseId(params.id)));
  } catch (e) { return handleError(e); }
}

function normalizeBody(raw: Record<string, unknown>) {
  const b: Record<string, unknown> = { ...raw };
  if ("unit_measure_id" in b) { b.unitMeasureId = b.unit_measure_id; delete b.unit_measure_id; }
  if ("is_active" in b) { b.isActive = b.is_active; delete b.is_active; }
  if ("compare_at_price" in b) { b.compareAtPrice = b.compare_at_price; delete b.compare_at_price; }
  if ("image_url" in b) { b.imageUrl = b.image_url; delete b.image_url; }
  if (b.isActive !== undefined) b.isActive = b.isActive === true || b.isActive === "true" || b.isActive === 1;
  if (b.quantity !== undefined) b.quantity = b.quantity === "" ? 0 : parseInt(String(b.quantity), 10);
  if (b.unitMeasureId !== undefined) b.unitMeasureId = b.unitMeasureId === "" || b.unitMeasureId === null ? undefined : parseInt(String(b.unitMeasureId), 10);
  if (b.unitMeasureId === undefined) delete b.unitMeasureId;
  return b;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = normalizeBody(await req.json() as Record<string, unknown>);
    return NextResponse.json(await productsService.update(id, body as any));
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await productsService.remove(parseId(params.id)));
  } catch (e) { return handleError(e); }
}
