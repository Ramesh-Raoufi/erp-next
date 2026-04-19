/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";
import { accountingService } from "@/services/accounting.service";

const prismaAny = prisma as any;

const includeRelations = {
  vendor: { select: { id: true, name: true } },
  items: true,
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.bill.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = await req.json();
    const { items, ...billData } = body;

    if (billData.vendorId) billData.vendorId = Number(billData.vendorId);
    if (billData.dueDate) billData.dueDate = new Date(billData.dueDate);
    if (billData.paidAt) billData.paidAt = new Date(billData.paidAt);

    const existing = await prismaAny.bill.findFirst({ where: { id, deletedAt: null } });
    const becomingPaid = billData.status === "paid" && existing?.status !== "paid";
    if (becomingPaid && !billData.paidAt) billData.paidAt = new Date();

    let subtotal = existing?.subtotal ? Number(existing.subtotal) : 0;
    const tax = billData.tax !== undefined ? Number(billData.tax) : (existing?.tax ? Number(existing.tax) : 0);

    if (items !== undefined) {
      const parsedItems = (items as any[]).map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      }));
      subtotal = parsedItems.reduce((s: number, i: any) => s + i.totalPrice, 0);

      await prismaAny.billItem.deleteMany({ where: { billId: id } });
      if (parsedItems.length > 0) {
        await prismaAny.billItem.createMany({
          data: parsedItems.map((i: any) => ({ ...i, billId: id })),
        });
      }
    }

    const total = subtotal + tax;
    const row = await prismaAny.bill.update({
      where: { id },
      data: { ...billData, subtotal, tax, total },
      include: includeRelations,
    });

    if (becomingPaid) {
      await accountingService.recordBillPaid(id, total);
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
    const row = await prismaAny.bill.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}
