import { prisma } from "../db/prisma";

export const transfersRepository = {
  create(data: any) {
    return prisma.transfer.create({ data });
  },

  findByCode(code: string) {
    return prisma.transfer.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.transfer.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.transfer.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.transfer.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { order: { include: { customer: true } }, driver: true }
    });
  },

  findById(id: number) {
    return prisma.transfer.findFirst({
      where: { id, deletedAt: null },
      include: { order: { include: { customer: true } }, driver: true, tracking: true, expenses: true }
    });
  },

  async update(id: number, data: any) {
    const existing = await prisma.transfer.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.transfer.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.transfer.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.transfer.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
