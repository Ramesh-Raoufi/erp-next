/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = await req.json();
    const { productId, quantity, fromLocation, toLocation, reference, notes } = body;

    if (!productId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "productId and positive quantity are required" }, { status: 400 });
    }

    const pid = Number(productId);
    const qty = Number(quantity);

    let inv = await prismaAny.inventory.findUnique({ where: { productId: pid } });
    if (!inv) {
      return NextResponse.json({ error: "No inventory record for this product" }, { status: 404 });
    }

    // Update location to destination (quantity stays same for location transfer)
    inv = await prismaAny.inventory.update({
      where: { productId: pid },
      data: { location: toLocation ?? inv.location, updatedAt: new Date() },
    });

    await prismaAny.inventoryMovement.create({
      data: {
        code: `TRF-${Date.now()}`,
        inventoryId: inv.id,
        type: "transfer",
        quantity: qty,
        fromLocation: fromLocation ?? null,
        toLocation: toLocation ?? null,
        reference: reference ?? null,
        notes: notes ?? null,
      },
    });

    await prismaAny.inventoryJournal.create({
      data: {
        code: `JRN-${Date.now()}`,
        productId: pid,
        type: "transfer",
        quantity: qty,
        quantityBefore: inv.quantity,
        quantityAfter: inv.quantity,
        reference: reference ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(inv, { status: 201 });
  } catch (e) { return handleError(e); }
}
