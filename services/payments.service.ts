import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { paymentsRepository } from "../repositories/payments.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const paymentsService = {
  async create(data: { orderId: number; amount: string; method: string; status: string; paidAt?: string | null; code?: string }) {
    const order = await prisma.order.findFirst({ where: { id: data.orderId, deletedAt: null } });
    if (!order) throw new ApiError(400, "Invalid order_id");

    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: paymentsRepository.findByCode,
      findByCodeAny: paymentsRepository.findByCodeAny,
      getLatestCode: paymentsRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await paymentsRepository.update(id, { code: null });
      }
    });
    return paymentsRepository.create({
      code,
      order: { connect: { id: data.orderId } },
      amount: new Decimal(data.amount),
      method: data.method,
      status: data.status,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined
    });
  },
  list() {
    return paymentsRepository.list();
  },
  async getById(id: number) {
    const payment = await paymentsRepository.findById(id);
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await paymentsRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await paymentsRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Payment not found");
    }
  },
  async remove(id: number) {
    try {
      return await paymentsRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Payment not found");
    }
  }
};
