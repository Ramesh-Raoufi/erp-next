import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    const user = await authService.me(userId);
    return NextResponse.json(user);
  } catch (e) {
    return handleError(e);
  }
}
