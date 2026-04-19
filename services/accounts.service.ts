import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { accountsRepository } from "../repositories/accounts.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const accountsService = {
  async create(data: {
    accountTypeId: number;
    name: string;
    balance?: string;
    description?: string | null;
    code?: string;
  }) {
    const accountType = await prisma.accountType.findFirst({
      where: { id: data.accountTypeId, deletedAt: null }
    });
    if (!accountType) throw new ApiError(400, "Invalid accountTypeId");

    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: accountsRepository.findByCode,
      findByCodeAny: accountsRepository.findByCodeAny,
      getLatestCode: accountsRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await accountsRepository.update(id, { code: null });
      }
    });

    return accountsRepository.create({
      code,
      name: data.name,
      balance: data.balance != null ? new Decimal(data.balance) : undefined,
      description: data.description ?? undefined,
      accountType: { connect: { id: data.accountTypeId } }
    });
  },
  list() {
    return accountsRepository.list();
  },
  async getById(id: number) {
    const account = await accountsRepository.findById(id);
    if (!account) throw new ApiError(404, "Account not found");
    return account;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await accountsRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    if (data.balance != null) {
      data.balance = new Decimal(data.balance);
    }
    if (data.accountTypeId) {
      const accountType = await prisma.accountType.findFirst({
        where: { id: data.accountTypeId, deletedAt: null }
      });
      if (!accountType) throw new ApiError(400, "Invalid accountTypeId");
      data.accountType = { connect: { id: data.accountTypeId } };
      delete data.accountTypeId;
    }
    try {
      return await accountsRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Account not found");
    }
  },
  async remove(id: number) {
    try {
      return await accountsRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Account not found");
    }
  }
};
