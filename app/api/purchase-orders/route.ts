/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.purchaseOrder.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: {
        vendor: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    if (body.vendorId) body.vendorId = Number(body.vendorId);
    if (body.expectedAt) body.expectedAt = new Date(body.expectedAt);
    const row = await prismaAny.purchaseOrder.create({ data: body });
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
