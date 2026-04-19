/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/services/users.service";
import { hashPassword } from "@/services/auth.service";
import { getAuthUserId, handleError } from "@/lib/api-helpers";
import { parseId } from "@/utils/http";
import { z } from "zod";

const updateSchema = z.object({
  code: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  role: z.enum(["admin", "operator", "accountant", "driver"]).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional()
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await usersService.getById(parseId(params.id)));
  } catch (e) { return handleError(e); }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    const id = parseId(params.id);
    const body = updateSchema.parse(await req.json());
    const passwordHash = body.password ? await hashPassword(body.password) : undefined;
    return NextResponse.json(await usersService.update(id, {
      ...body,
      ...(passwordHash ? { passwordHash } : {})
    } as any));
  } catch (e) { return handleError(e); }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    getAuthUserId(req);
    return NextResponse.json(await usersService.remove(parseId(params.id)));
  } catch (e) { return handleError(e); }
}
