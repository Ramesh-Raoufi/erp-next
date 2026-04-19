/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";

const prismaAny = prisma as any;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.bill.findFirst({
      where: { id, deletedAt: null },
      include: { vendor: { select: { id: true, name: true } } },
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = await req.json();
    if (body.vendorId) body.vendorId = Number(body.vendorId);
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    if (body.paidAt) body.paidAt = new Date(body.paidAt);
    const row = await prismaAny.bill.update({ where: { id }, data: body });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.bill.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}
