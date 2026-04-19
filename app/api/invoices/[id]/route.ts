/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";
import { accountingService } from "@/services/accounting.service";

const prismaAny = prisma as any;

const includeRelations = {
  customer: { select: { id: true, name: true, lastName: true, email: true, phone: true } },
  order: {
    select: {
      id: true, code: true, origin: true, destination: true,
      items: { include: { product: { select: { id: true, name: true } } } },
    },
  },
  items: true,
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.invoice.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
    if (!row) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = await req.json();
    const { items, ...invoiceData } = body;

    if (invoiceData.customerId) invoiceData.customerId = Number(invoiceData.customerId);
    if ("orderId" in invoiceData) invoiceData.orderId = invoiceData.orderId ? Number(invoiceData.orderId) : null;
    if (invoiceData.dueDate) invoiceData.dueDate = new Date(invoiceData.dueDate);
    if (invoiceData.paidAt) invoiceData.paidAt = new Date(invoiceData.paidAt);

    // Fetch existing to detect paid transition
    const existing = await prismaAny.invoice.findFirst({ where: { id, deletedAt: null } });
    const becomingPaid = invoiceData.status === "paid" && existing?.status !== "paid";
    if (becomingPaid && !invoiceData.paidAt) invoiceData.paidAt = new Date();

    // Handle items update
    let subtotal = existing?.subtotal ? Number(existing.subtotal) : 0;
    const tax = invoiceData.tax !== undefined ? Number(invoiceData.tax) : (existing?.tax ? Number(existing.tax) : 0);

    if (items !== undefined) {
      const parsedItems = (items as any[]).map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      }));
      subtotal = parsedItems.reduce((s: number, i: any) => s + i.totalPrice, 0);

      // Replace items: delete old, create new
      await prismaAny.invoiceItem.deleteMany({ where: { invoiceId: id } });
      if (parsedItems.length > 0) {
        await prismaAny.invoiceItem.createMany({
          data: parsedItems.map((i: any) => ({ ...i, invoiceId: id })),
        });
      }
    }

    const total = subtotal + tax;
    const row = await prismaAny.invoice.update({
      where: { id },
      data: { ...invoiceData, subtotal, tax, total },
      include: includeRelations,
    });

    if (becomingPaid) {
      await accountingService.recordInvoicePaid(id, total);
    }

    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  return PUT(req, ctx);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const existing = await prismaAny.invoice.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const row = await prismaAny.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}
