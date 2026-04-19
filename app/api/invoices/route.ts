/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.invoice.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: {
        customer: { select: { id: true, name: true, lastName: true, email: true, phone: true } },
        order: { select: { id: true, code: true, origin: true, destination: true, items: true } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    if (body.customerId) body.customerId = Number(body.customerId);
    if (body.orderId) body.orderId = Number(body.orderId) || null;
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.paidAt) body.paidAt = new Date(body.paidAt);
    const row = await prismaAny.invoice.create({
      data: body,
      include: {
        customer: { select: { id: true, name: true, lastName: true } },
        order: { select: { id: true, code: true } },
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
