import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/services/store.service";
import { handleError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await storeService.createOrder({
      customer: body.customer,
      shipping: body.shipping,
      items: body.items,
      paymentMethod: body.payment_method ?? "cash"
    });
    return NextResponse.json(order, { status: 201 });
  } catch (e) { return handleError(e); }
}
