import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/services/store.service";
import { handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json(await storeService.getProduct(parseId(params.id)));
  } catch (e) { return handleError(e); }
}
