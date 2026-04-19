/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.vendor.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const vendor = await prismaAny.vendor.create({ data: body });
    return NextResponse.json(vendor, { status: 201 });
  } catch (e) { return handleError(e); }
}
