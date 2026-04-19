import { prisma } from "../db/prisma";
import { ApiError } from "../utils/http";
import { trackingRepository } from "../repositories/tracking.repository";
import { normalizeCode, prepareCodeForCreate } from "../utils/code";

export const trackingService = {
  async create(data: { transferId: number; status: string; location?: string | null; code?: string }) {
    const transfer = await prisma.transfer.findFirst({ where: { id: data.transferId, deletedAt: null } });
    if (!transfer) throw new ApiError(400, "Invalid transfer_id");
    const code = await prepareCodeForCreate({
      provided: data.code,
      findByCode: trackingRepository.findByCode,
      findByCodeAny: trackingRepository.findByCodeAny,
      getLatestCode: trackingRepository.getLatestCode,
      clearCodeForId: async (id) => {
        await trackingRepository.update(id, { code: null });
      }
    });
    return trackingRepository.create({
      transfer: { connect: { id: data.transferId } },
      code,
      status: data.status,
      location: data.location ?? undefined
    });
  },
  list() {
    return trackingRepository.list();
  },
  async getById(id: number) {
    const t = await trackingRepository.findById(id);
    if (!t) throw new ApiError(404, "Tracking record not found");
    return t;
  },
  async update(id: number, data: any) {
    if (data.code) {
      const normalized = normalizeCode(data.code);
      if (normalized) {
        const existing = await trackingRepository.findByCode(normalized);
        if (existing && existing.id !== id) {
          throw new ApiError(400, "Code already exists");
        }
        data.code = normalized;
      }
    }
    try {
      return await trackingRepository.update(id, data);
    } catch {
      throw new ApiError(404, "Tracking record not found");
    }
  },
  async remove(id: number) {
    try {
      return await trackingRepository.softDelete(id);
    } catch {
      throw new ApiError(404, "Tracking record not found");
    }
  },
  async publicLookup(transferId: number) {
    const transfer = await prisma.transfer.findFirst({
      where: { id: transferId, deletedAt: null },
      include: { order: true }
    });

    if (!transfer) throw new ApiError(404, "Transfer not found");

    const history = await trackingRepository.findByTransferId(transferId);

    const latest = history[0];

    return {
      transferId: transfer.id,
      transferStatus: transfer.status,
      order: {
        id: transfer.orderId,
        origin: transfer.order.origin,
        destination: transfer.order.destination,
        status: transfer.order.status
      },
      currentStatus: latest?.status ?? transfer.status,
      lastUpdate: latest?.updatedAt ?? transfer.updatedAt,
      history: history.map((item) => ({
        id: item.id,
        status: item.status,
        location: item.location,
        updatedAt: item.updatedAt
      }))
    };
  }
};
