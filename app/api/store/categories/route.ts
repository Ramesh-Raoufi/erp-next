import { NextResponse } from "next/server";
import { storeService } from "@/services/store.service";
import { handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    return NextResponse.json(await storeService.listCategories());
  } catch (e) { return handleError(e); }
}
