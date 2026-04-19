/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/services/auth.service";
import { ApiError } from "@/utils/http";

export function getAuthUserId(req: NextRequest): number {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) throw new ApiError(401, "Unauthorized");
  const payload = verifyToken(token);
  return payload.sub;
}

export function handleError(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Error) {
    // Zod validation errors
    if ((e as any).errors) {
      return NextResponse.json({ error: e.message, issues: (e as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
