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
      include: {
        vendor: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, code: true } }, unitMeasure: { select: { id: true, name: true, code: true } } } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const { items = [], ...billData } = body;

    if (billData.vendorId) billData.vendorId = Number(billData.vendorId);
    if (billData.dueDate) billData.dueDate = new Date(billData.dueDate);
    if (billData.paidAt) billData.paidAt = new Date(billData.paidAt);
    // Remove tax if present
    delete billData.tax;

    const parsedItems = (items as any[]).map((item: any) => ({
      ...(item.productId ? { productId: Number(item.productId) } : {}),
      ...(item.unitMeasureId ? { unitMeasureId: Number(item.unitMeasureId) } : {}),
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const total = parsedItems.reduce((s: number, i: any) => s + i.totalPrice, 0);

    const row = await prismaAny.bill.create({
      data: {
        ...billData,
        subtotal: total,
        total,
        items: parsedItems.length > 0 ? { create: parsedItems } : undefined,
      },
      include: {
        vendor: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true } }, unitMeasure: { select: { id: true, name: true } } } },
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
