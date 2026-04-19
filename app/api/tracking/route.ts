/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { trackingService } from "@/services/tracking.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await trackingService.list());
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const result = await trackingService.create(body as any);
    return NextResponse.json(result, { status: 201 });
  } catch (e) { return handleError(e); }
}
