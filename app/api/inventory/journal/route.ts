/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

const prismaAny = prisma as any;

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const rows = await prismaAny.inventoryJournal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, code: true } },
      },
    });
    return NextResponse.json(rows);
  } catch (e) { return handleError(e); }
}
