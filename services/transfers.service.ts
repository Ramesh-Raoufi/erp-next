import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { transfersRepository } from "../repositories/transfers.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const transfersService = {
  async syncOrderStatusFromTransfer(transfer: {
    orderId: number;
    status?: string | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    const status = transfer.status ?? undefined;
    const shippedAt = transfer.shippedAt ?? undefined;
    const deliveredAt = transfer.deliveredAt ?? undefined;

    let nextStatus: "shipped" | "delivered" | undefined;
    if (deliveredAt || status === "completed") {
      nextStatus = "delivered";
    } else if (shippedAt || status === "assigned" || status === "in_transit") {
      nextStatus = "shipped";
    }

    if (!nextStatus) return;

    if (nextStatus === "delivered") {
      await prisma.order.updateMany({
        where: {
          id: transfer.orderId,
          deletedAt: null,
          status: { not: "cancelled" }
        },
        data: { status: "delivered" }
      });
      return;
    }

    await prisma.order.updateMany({
      where: {
        id: transfer.orderId,
        deletedAt: null,
        status: { in: ["pending", "shipped"] }
      },
      data: { status: "shipped" }
    });
  },

  async create(data: {
    orderId: number;
    driverId?: number | null;
    vehicleInfo?: string | null;
    status?: string;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    code?: string;
  }) {
    const order = await prisma.order.findFirst({ where: { id: data.orderId, deletedAt: null } });
    if (!order) throw new ApiError(400, "Invalid order_id");

    if (data.driverId != null) {
      const driver = await prisma.driver.findFirst({ where: { id: data.driverId, deletedAt: null } });
      if (!driver) throw new ApiError(400, "Invalid driver_id");
    }

    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: transfersRepository.findByCode,
      findByCodeAny: transfersRepository.findByCodeAny,
      getLatestCode: transfersRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await transfersRepository.update(id, { code: null });
      }
    });

    const transfer = await transfersRepository.create({
      code,
      order: { connect: { id: data.orderId } },
      driver: data.driverId != null ? { connect: { id: data.driverId } } : undefined,
      vehicleInfo: data.vehicleInfo ?? undefined,
      status: (data.status as any) ?? undefined,
      shippedAt: data.shippedAt ? new Date(data.shippedAt) : undefined,
      deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined
    } as unknown as Prisma.TransferCreateInput);
    await transfersService.syncOrderStatusFromTransfer(transfer);
    return transfer;
  },

  list() {
    return transfersRepository.list();
  },

  async getById(id: number) {
    const transfer = await transfersRepository.findById(id);
    if (!transfer) throw new ApiError(404, "Transfer not found");
    return transfer;
  },

  async update(id: number, data: Prisma.TransferUpdateInput) {
    if ((data as any).code) {
      const normalized = normalizeCode((data as any).code);
      if (normalized) {
        const existing = await transfersRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        (data as any).code = normalized;
      }
    }
    try {
      const transfer = await transfersRepository.update(id, data);
      await transfersService.syncOrderStatusFromTransfer(transfer);
      return transfer;
    } catch {
      throw new ApiError(404, "Transfer not found");
    }
  },

  async remove(id: number) {
    try {
      return await transfersRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Transfer not found");
    }
  }
};
