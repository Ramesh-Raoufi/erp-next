/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";

const prismaAny = prisma as any;

const includeRelations = {
  customer: { select: { id: true, name: true, lastName: true, email: true, phone: true } },
  order: {
    select: {
      id: true,
      code: true,
      origin: true,
      destination: true,
      items: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  },
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.invoice.findFirst({
      where: { id, deletedAt: null },
      include: includeRelations,
    });
    if (!row) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = await req.json();
    if (body.customerId) body.customerId = Number(body.customerId);
    if ("orderId" in body) body.orderId = body.orderId ? Number(body.orderId) : null;
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.paidAt) body.paidAt = new Date(body.paidAt);
    // Auto-set paidAt when status moves to paid
    if (body.status === "paid" && !body.paidAt) body.paidAt = new Date();
    const row = await prismaAny.invoice.update({
      where: { id },
      data: body,
      include: includeRelations,
    });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const existing = await prismaAny.invoice.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const row = await prismaAny.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}
