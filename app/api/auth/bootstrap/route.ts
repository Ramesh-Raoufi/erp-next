import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { handleError } from "@/lib/api-helpers";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const result = await authService.bootstrap(
      body.name, body.lastName, body.username, body.email, body.password
    );
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
