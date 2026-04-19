/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const { productId, quantity, reference, notes } = body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "productId and positive quantity are required" }, { status: 400 });
    }

    const pid = Number(productId);
    const qty = Number(quantity);

    // Get or init inventory
    let inv = await prismaAny.inventory.findUnique({ where: { productId: pid } });
    if (!inv) {
      inv = await prismaAny.inventory.create({ data: { productId: pid, quantity: 0 } });
    }
    if (inv.quantity < qty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 422 });
    }

    const before = inv.quantity;
    inv = await prismaAny.inventory.update({
      where: { productId: pid },
      data: { quantity: { decrement: qty }, updatedAt: new Date() },
    });

    await prismaAny.inventoryMovement.create({
      data: {
        code: `EXT-${Date.now()}`,
        inventoryId: inv.id,
        type: "exit",
        quantity: qty,
        fromLocation: inv.location ?? null,
        reference: reference ?? null,
        notes: notes ?? null,
      },
    });

    await prismaAny.inventoryJournal.create({
      data: {
        code: `JRN-${Date.now()}`,
        productId: pid,
        type: "exit",
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
