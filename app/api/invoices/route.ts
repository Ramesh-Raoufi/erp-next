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
        order: { select: { id: true, code: true, origin: true, destination: true } },
        items: true,
      },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const { items = [], ...invoiceData } = body;

    if (invoiceData.customerId) invoiceData.customerId = Number(invoiceData.customerId);
    if (invoiceData.orderId) invoiceData.orderId = Number(invoiceData.orderId) || null;
    if (invoiceData.dueDate) invoiceData.dueDate = new Date(invoiceData.dueDate);
    if (invoiceData.paidAt) invoiceData.paidAt = new Date(invoiceData.paidAt);

    // Calculate totals from items
    const parsedItems = (items as any[]).map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const subtotal = parsedItems.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const tax = Number(invoiceData.tax) || 0;
    const total = subtotal + tax;

    const row = await prismaAny.invoice.create({
      data: {
        ...invoiceData,
        subtotal,
        tax,
        total,
        items: parsedItems.length > 0 ? { create: parsedItems } : undefined,
      },
      include: {
        customer: { select: { id: true, name: true, lastName: true } },
        order: { select: { id: true, code: true } },
        items: true,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) { return handleError(e); }
}
