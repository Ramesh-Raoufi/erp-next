/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { driversService } from "@/services/drivers.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await driversService.list());
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const result = await driversService.create(body as any);
    return NextResponse.json(result, { status: 201 });
  } catch (e) { return handleError(e); }
}
