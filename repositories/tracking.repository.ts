import { prisma } from "../db/prisma";

export const trackingRepository = {
  create(data: any) {
    return prisma.tracking.create({ data });
  },

  findByCode(code: string) {
    return prisma.tracking.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.tracking.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.tracking.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  findByTransferId(transferId: number) {
    return prisma.tracking.findMany({
      where: { transferId, deletedAt: null },
      orderBy: { updatedAt: "desc" }
    });
  },

  list() {
    return prisma.tracking.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { transfer: true }
    });
  },

  findById(id: number) {
    return prisma.tracking.findFirst({ where: { id, deletedAt: null }, include: { transfer: true } });
  },

  async update(id: number, data: any) {
    const existing = await prisma.tracking.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.tracking.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.tracking.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.tracking.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
