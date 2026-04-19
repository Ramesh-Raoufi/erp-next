import { prisma } from "../db/prisma";

export const paymentsRepository = {
  create(data: any) {
    return prisma.payment.create({ data });
  },

  findByCode(code: string) {
    return prisma.payment.findFirst({ where: { code, deletedAt: null } });
  },

  findByCodeAny(code: string) {
    return prisma.payment.findFirst({ where: { code } });
  },

  getLatestCode() {
    return prisma.payment.findFirst({
      where: { deletedAt: null, code: { not: null } },
      orderBy: { code: "desc" },
      select: { code: true }
    });
  },

  list() {
    return prisma.payment.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
      include: { order: true }
    });
  },

  findById(id: number) {
    return prisma.payment.findFirst({ where: { id, deletedAt: null }, include: { order: true } });
  },

  async update(id: number, data: any) {
    const existing = await prisma.payment.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.payment.update({ where: { id }, data });
  },

  async softDelete(id: number) {
    const existing = await prisma.payment.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new Error("NOT_FOUND");
    return prisma.payment.update({ where: { id }, data: { deletedAt: new Date(), code: null } });
  }
};
