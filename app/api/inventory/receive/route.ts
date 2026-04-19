/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const { productId, quantity, location, reference, notes } = body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "productId and positive quantity are required" }, { status: 400 });
    }

    const pid = Number(productId);
    const qty = Number(quantity);

    // Upsert inventory record
    const inv = await prismaAny.inventory.upsert({
      where: { productId: pid },
      update: { quantity: { increment: qty }, ...(location ? { location } : {}), updatedAt: new Date() },
      create: { productId: pid, quantity: qty, location: location ?? null },
    });

    // Create movement
    const movCode = `RCV-${Date.now()}`;
    await prismaAny.inventoryMovement.create({
      data: {
        code: movCode,
        inventoryId: inv.id,
        type: "receive",
        quantity: qty,
        toLocation: location ?? null,
        reference: reference ?? null,
        notes: notes ?? null,
      },
    });

    // Create journal entry
    const before = inv.quantity - qty;
    await prismaAny.inventoryJournal.create({
      data: {
        code: `JRN-${Date.now()}`,
        productId: pid,
        type: "receive",
        quantity: qty,
        quantityBefore: before,
        quantityAfter: inv.quantity,
        reference: reference ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(inv, { status: 201 });
  } catch (e) { return handleError(e); }
}
