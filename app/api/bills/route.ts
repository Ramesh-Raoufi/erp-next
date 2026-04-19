/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.bill.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { vendor: { select: { id: true, name: true } } },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    if (body.vendorId) body.vendorId = Number(body.vendorId);
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.paidAt) body.paidAt = new Date(body.paidAt);
    const row = await prismaAny.bill.create({ data: body });
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
