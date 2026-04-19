import { prisma } from "../db/prisma";

export const adjustmentsRepository = {
  create(data: any) {
    return prisma.adjustment.create({ data });
  },

  findByCode(code: string) {
    return prisma.adjustment.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.adjustment.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.adjustment.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.adjustment.findMany({ where: { deletedAt: null }, orderBy: { id: "desc" } });
  },

  findById(id: number) {
    return prisma.adjustment.findFirst({ where: { id, deletedAt: null } });
  },

  async update(id: number, data: any) {
    const existing = await prisma.adjustment.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.adjustment.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.adjustment.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.adjustment.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
