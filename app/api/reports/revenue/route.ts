import { NextRequest, NextResponse } from "next/server";
import { reportsService } from "@/services/reports.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const revenue = await reportsService.totalRevenue();
    return NextResponse.json({ total_revenue: revenue.toString() });
  } catch (e) { return handleError(e); }
}
