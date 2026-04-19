import { NextRequest, NextResponse } from "next/server";
import { reportsService } from "@/services/reports.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const result = await reportsService.profitLoss();
    return NextResponse.json({
      revenue: result.revenue.toString(),
      shipment_expenses: result.expenses.shipment.toString(),
      general_expenses: result.expenses.general.toString(),
      adjustments: result.adjustments.toString(),
      profit: result.profit.toString()
    });
  } catch (e) { return handleError(e); }
}
