import type { Prisma, AccountType } from "@prisma/client";
import { ApiError } from "../utils/http";
import { accountTypesRepository } from "../repositories/accountTypes.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const accountTypesService = {
  async create(data: Prisma.AccountTypeCreateInput) {
    const code = await prepareCodeForCreate({
      provided: (data as any).code,
      findByCode: accountTypesRepository.findByCode,
      findByCodeAny: accountTypesRepository.findByCodeAny,
      getLatestCode: accountTypesRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await accountTypesRepository.update(id, { code: null });
      }
    });
    return accountTypesRepository.create({ ...data, code });
  },
  list() {
    return accountTypesRepository.list();
  },
  async getById(id: number) {
    const accountType = await accountTypesRepository.findById(id);
    if (!accountType) throw new ApiError(404, "Account type not found");
    return accountType;
  },
  async update(id: number, data: Prisma.AccountTypeUpdateInput): Promise<AccountType> {
    if ((data as any).code) {
      const normalized = normalizeCode((data as any).code);
      if (normalized) {
        const existing = await accountTypesRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        (data as any).code = normalized;
      }
    }
    try {
      return await accountTypesRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Account type not found");
    }
  },
  async remove(id: number) {
    try {
      return await accountTypesRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Account type not found");
    }
  }
};
