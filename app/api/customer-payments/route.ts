/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { accountingService } from "@/services/accounting.service";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.customerPayment.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { customer: { select: { id: true, name: true, lastName: true } } },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    if (body.customerId) body.customerId = Number(body.customerId);
    if (body.invoiceId) body.invoiceId = Number(body.invoiceId) || null;
    if (body.paidAt) body.paidAt = new Date(body.paidAt);
    const row = await prismaAny.customerPayment.create({ data: body });
    await accountingService.recordCustomerPayment(row.id, Number(body.amount) || 0);
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
