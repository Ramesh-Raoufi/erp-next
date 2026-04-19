import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { handleError } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const result = await authService.login(body.username, body.password);
    return NextResponse.json(result);
  } catch (e) {
    return handleError(e);
  }
}
