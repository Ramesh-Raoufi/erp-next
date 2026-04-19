import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { expensesRepository } from "../repositories/expenses.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const expensesService = {
  async create(data: {
    type: string;
    transferId?: number | null;
    amount: string;
    category: string;
    description?: string | null;
    paidAt?: string | null;
    code?: string;
  }) {
    if (data.type === "shipment") {
      if (!data.transferId) throw new ApiError(400, "reference_id is required for shipment expenses");
      const transfer = await prisma.transfer.findFirst({ where: { id: data.transferId, deletedAt: null } });
      if (!transfer) throw new ApiError(400, "Invalid reference_id (transfer)");
    }
    if (data.type === "general" && data.transferId != null) {
      throw new ApiError(400, "reference_id must be null for general expenses");
    }

    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: expensesRepository.findByCode,
      findByCodeAny: expensesRepository.findByCodeAny,
      getLatestCode: expensesRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await expensesRepository.update(id, { code: null });
      }
    });

    return expensesRepository.create({
      code,
      type: data.type,
      transfer: data.transferId ? { connect: { id: data.transferId } } : undefined,
      amount: new Decimal(data.amount),
      category: data.category,
      description: data.description ?? undefined,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined
    });
  },
  list() {
    return expensesRepository.list();
  },
  async getById(id: number) {
    const expense = await expensesRepository.findById(id);
    if (!expense) throw new ApiError(404, "Expense not found");
    return expense;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await expensesRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await expensesRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Expense not found");
    }
  },
  async remove(id: number) {
    try {
      return await expensesRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Expense not found");
    }
  }
};
