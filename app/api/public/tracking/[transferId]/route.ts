/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { trackingService } from "@/services/tracking.service";
import { handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";

export async function GET(_req: NextRequest, { params }: { params: { transferId: string } }) {
  try {
    const transferId = parseId(params.transferId);
    return NextResponse.json(await trackingService.publicLookup(transferId));
  } catch (e) { return handleError(e); }
}
