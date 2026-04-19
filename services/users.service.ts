/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Prisma, User } from "@prisma/client";
import { ApiError } from "../utils/http";
import { usersRepository } from "../repositories/users.repository";

export const usersService = {
  normalizeCode(value: unknown) {
    if (value == null) return undefined;
    const raw = String(value).trim();
    if (!raw) return undefined;
    const num = Number.parseInt(raw, 10);
    if (!Number.isFinite(num) || num <= 0) {
      throw new ApiError(400, "Code must be a positive number");
    }
    return String(num).padStart(5, "0");
  },
  async create(data: Prisma.UserCreateInput) {
    const providedCode = this.normalizeCode((data as any).code);
    if (providedCode) {
      const existingCode = await usersRepository.findByCode(providedCode);
      if (existingCode) {
        throw new ApiError(400, "Code already exists");
      }
      const existingCodeAny = await usersRepository.findByCodeAny(providedCode);
      if (existingCodeAny && existingCodeAny.deletedAt) {
        await usersRepository.update(existingCodeAny.id, { code: null });
      }
    }
    if (data.email) {
      const emailValue = String(data.email);
      const existingEmail = await usersRepository.findByEmail(emailValue);
      if (existingEmail) {
        throw new ApiError(400, "Email already exists");
      }
      const existingEmailAny = await usersRepository.findByEmailAny(emailValue);
      if (existingEmailAny && existingEmailAny.deletedAt) {
        await usersRepository.update(existingEmailAny.id, {
          email: null,
          passwordHash: null
        });
      }
    }

    if ((data as any).username) {
      const usernameValue = String((data as any).username);
      const existingUsername = await usersRepository.findByUsername(usernameValue);
      if (existingUsername) {
        throw new ApiError(400, "Username already exists");
      }
      const existingUsernameAny = await usersRepository.findByUsernameAny(usernameValue);
      if (existingUsernameAny && existingUsernameAny.deletedAt) {
        await usersRepository.update(existingUsernameAny.id, {
          username: null,
          passwordHash: null
        });
      }
    }

    const nextCode = providedCode
      ? providedCode
      : (() => {
          const latest = usersRepository.getLatestCode();
          return latest.then((row) => {
            const lastNumber = row?.code ? Number.parseInt(row.code, 10) : 0;
            return String((Number.isFinite(lastNumber) ? lastNumber : 0) + 1).padStart(5, "0");
          });
        })();

    try {
      return await usersRepository.create({
        ...data,
        code: await nextCode
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(", ") : String(err?.meta?.target ?? "");
        throw new ApiError(400, target ? `Unique constraint failed on: ${target}` : "Email or username already exists");
      }
      throw err;
    }
  },
  list() {
    return usersRepository.list();
  },
  async getById(id: number) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    if ((data as any).code) {
      const normalizedCode = this.normalizeCode((data as any).code);
      if (normalizedCode) {
        const existingCode = await usersRepository.findByCode(normalizedCode);
        if (existingCode && existingCode.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        (data as any).code = normalizedCode;
      }
    }
    if (data.email) {
      const existingEmail = await usersRepository.findByEmail(String(data.email));
      if (existingEmail && existingEmail.id !== id) {
        throw new ApiError(400, "Email already exists");
      }
    }

    if ((data as any).username) {
      const existingUsername = await usersRepository.findByUsername(String((data as any).username));
      if (existingUsername && existingUsername.id !== id) {
        throw new ApiError(400, "Username already exists");
      }
    }
    try {
      return await usersRepository.update(id, data) as any;
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(", ") : String(err?.meta?.target ?? "");
        throw new ApiError(400, target ? `Unique constraint failed on: ${target}` : "Email or username already exists");
      }
      throw new ApiError(404, "User not found");
    }
  },
  async remove(id: number) {
    try {
      return await usersRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "User not found");
    }
  }
};
