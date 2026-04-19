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
    const row = await prismaAny.vendor.findFirst({ where: { id, deletedAt: null } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = await req.json();
    const row = await prismaAny.vendor.update({ where: { id }, data: body });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const row = await prismaAny.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json(row);
  } catch (e) { return handleError(e); }
}
