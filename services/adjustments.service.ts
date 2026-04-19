import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { adjustmentsRepository } from "../repositories/adjustments.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

async function assertRelatedExists(relatedType: string, relatedId: number) {
  if (relatedType === "order") {
    const rec = await prisma.order.findFirst({ where: { id: relatedId, deletedAt: null } });
    if (!rec) throw new ApiError(400, "Invalid related_id for order");
    return;
  }
  if (relatedType === "payment") {
    const rec = await prisma.payment.findFirst({ where: { id: relatedId, deletedAt: null } });
    if (!rec) throw new ApiError(400, "Invalid related_id for payment");
    return;
  }
  if (relatedType === "expense") {
    const rec = await prisma.expense.findFirst({ where: { id: relatedId, deletedAt: null } });
    if (!rec) throw new ApiError(400, "Invalid related_id for expense");
    return;
  }
}

export const adjustmentsService = {
  async create(data: { relatedType: string; relatedId: number; amount: string; reason: string; code?: string }) {
    await assertRelatedExists(data.relatedType, data.relatedId);
    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: adjustmentsRepository.findByCode,
      findByCodeAny: adjustmentsRepository.findByCodeAny,
      getLatestCode: adjustmentsRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await adjustmentsRepository.update(id, { code: null });
      }
    });
    return adjustmentsRepository.create({
      code,
      relatedType: data.relatedType,
      relatedId: data.relatedId,
      amount: new Decimal(data.amount),
      reason: data.reason
    });
  },
  list() {
    return adjustmentsRepository.list();
  },
  async getById(id: number) {
    const adj = await adjustmentsRepository.findById(id);
    if (!adj) throw new ApiError(404, "Adjustment not found");
    return adj;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await adjustmentsRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await adjustmentsRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Adjustment not found");
    }
  },
  async remove(id: number) {
    try {
      return await adjustmentsRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Adjustment not found");
    }
  }
};
