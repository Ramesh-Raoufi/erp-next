import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { ordersRepository } from "../repositories/orders.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

const prismaAny = prisma as any;

export const ordersService = {
  async create(data: {
    customerId: number;
    origin: string;
    destination: string;
    status?: string;
    code?: string;
    items: Array<{ productId: number; quantity: number; unitPrice: string; unitMeasureId?: number }>;
  }) {
    const customer = await prismaAny.customer.findFirst({
      where: { id: data.customerId, deletedAt: null }
    });
    if (!customer) throw new ApiError(400, "Invalid customer_id");

    if (!data.items || data.items.length === 0) {
      throw new ApiError(400, "Order items are required");
    }

    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      select: { id: true, unitMeasureId: true }
    });
    if (products.length !== productIds.length) {
      throw new ApiError(400, "Invalid product_id in items");
    }

    const productUnitMap = new Map(products.map((p) => [p.id, p.unitMeasureId]));
    const resolvedUnitMeasureIds = data.items.map((item) => {
      return item.unitMeasureId ?? productUnitMap.get(item.productId) ?? null;
    });

    if (resolvedUnitMeasureIds.some((id) => !id)) {
      throw new ApiError(400, "unit_measure_id is required for each item");
    }

    const unitMeasureIds = [...new Set(resolvedUnitMeasureIds as number[])];
    const unitMeasures = await prismaAny.unitMeasure.findMany({
      where: { id: { in: unitMeasureIds }, deletedAt: null },
      select: { id: true }
    });
    if (unitMeasures.length !== unitMeasureIds.length) {
      throw new ApiError(400, "Invalid unit_measure_id in items");
    }

    const total = data.items.reduce((sum, item) => {
      const line = new Decimal(item.unitPrice).mul(item.quantity);
      return sum.plus(line);
    }, new Decimal(0));

    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: ordersRepository.findByCode,
      findByCodeAny: ordersRepository.findByCodeAny,
      getLatestCode: ordersRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await ordersRepository.update(id, { code: null });
      }
    });

    return ordersRepository.create({
      customer: { connect: { id: data.customerId } },
      code,
      origin: data.origin,
      destination: data.destination,
      status: (data.status as any) ?? undefined,
      totalPrice: total,
      items: {
        create: data.items.map((item, index) => ({
          product: { connect: { id: item.productId } },
          unitMeasure: { connect: { id: resolvedUnitMeasureIds[index] as number } },
          quantity: item.quantity,
          unitPrice: new Decimal(item.unitPrice),
          totalPrice: new Decimal(item.unitPrice).mul(item.quantity)
        }))
      }
    });
  },

  list() {
    return ordersRepository.list();
  },

  async getById(id: number) {
    const order = await ordersRepository.findById(id);
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },

  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await ordersRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await ordersRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Order not found");
    }
  },

  async remove(id: number) {
    try {
      return await ordersRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Order not found");
    }
  }
};
