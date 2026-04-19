import { NextRequest, NextResponse } from "next/server";
import { reportsService } from "@/services/reports.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    const expenses = await reportsService.totalExpenses();
    return NextResponse.json({
      shipment_expenses: expenses.shipment.toString(),
      general_expenses: expenses.general.toString(),
      total_expenses: expenses.shipment.plus(expenses.general).toString()
    });
  } catch (e) { return handleError(e); }
}
