/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    // Return all products with their inventory record (upsert-style: include nulls via left join)
    const products = await prismaAny.product.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        inventory: true,
        unitMeasure: { select: { id: true, name: true, symbol: true } },
      },
    });
    return NextResponse.json(products);
  } catch (e) { return handleError(e); }
}
