/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/services/users.service";
import { hashPassword } from "@/services/auth.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().optional().nullable(),
  name: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  role: z.enum(["admin", "operator", "accountant", "driver"]),
  email: z.string().email(),
  phone: z.string().min(3).optional().nullable(),
  password: z.string().min(6)
});

export async function GET(req: NextRequest) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await usersService.list());
  } catch (e) { return handleError(e); }
}

export async function POST(req: NextRequest) {
  try {
    getAuthUserId(req);
    const body = createSchema.parse(await req.json());
    const passwordHash = body.password ? await hashPassword(body.password) : undefined;
    const user = await usersService.create({
      name: body.name,
      lastName: body.lastName,
      username: body.username,
      email: body.email,
      role: body.role,
      phone: body.phone ?? undefined,
      passwordHash
    } as any);
    return NextResponse.json(user, { status: 201 });
  } catch (e) { return handleError(e); }
}
